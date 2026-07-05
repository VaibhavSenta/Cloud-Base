'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../hooks/useSecureQuery';
import useWindowSize from '../../hooks/useWindowSize';
import api from '../../utils/api';
import { encryptPayload } from '../../utils/security/networkCrypto';
import PersonalInfoDesktop from './Desktop/PersonalInfoDesktop';
import PersonalInfoTablet from './Tablet/PersonalInfoTablet';
import PersonalInfoMobile from './Mobile/PersonalInfoMobile';
import styles from './PersonalInfo.module.css';
import CloudSpinner from '../UI/CloudSpinner/CloudSpinner';

/**
 * Personal Information Component Wrapper
 */
export default function PersonalInfo({ forceWidth }) {
  const queryClient = useSecureQueryClient();
  const { width: windowWidth } = useWindowSize();
  const width = forceWidth || windowWidth;
  
  const [editField, setEditField] = useState(null); // 'name', 'dob', 'gender', 'recoveryEmail', 'profilePic'
  const [formVal, setFormVal] = useState({});
  const [selectedPreview, setSelectedPreview] = useState(null);

  // Fetch current user from React Query cache
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  // Mutation to handle backend profile updates
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const encryptedBody = await encryptPayload(updatedData);
      const res = await api.patch('/auth/profile', encryptedBody);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setSecureQueryData(['user'], (old) => {
        if (!old) return data;
        return { ...old, ...data };
      });
      handleCloseModal();
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update details');
    }
  });

  const editableKeys = ['username', 'name', 'dob', 'gender', 'recoveryEmail', 'profilePic'];

  const handleEditClick = (key) => {
    if (!editableKeys.includes(key)) {
      alert("Email changes are restricted for security. Please request via Security Settings.");
      return;
    }
    setEditField(key);
    
    if (key === 'username') {
      setFormVal({
        userName: user?.userName || ''
      });
    } else if (key === 'name') {
      setFormVal({
        firstName: user?.firstName || '',
        lastName: user?.lastName || ''
      });
    } else if (key === 'dob') {
      setFormVal({
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
      });
    } else if (key === 'gender') {
      setFormVal({
        gender: user?.gender || 'Not selected'
      });
    } else if (key === 'recoveryEmail') {
      setFormVal({
        recoveryEmail: user?.recoveryEmail || ''
      });
    } else if (key === 'profilePic') {
      setFormVal({
        profilePic: user?.profilePic || ''
      });
      setSelectedPreview(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormVal(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setSelectedPreview(base64String);
      setFormVal({ profilePic: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleCloseModal = () => {
    setEditField(null);
    setSelectedPreview(null);
    setFormVal({});
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (editField === 'name') {
      updateMutation.mutate({
        firstName: formVal.firstName,
        lastName: formVal.lastName
      });
    } else {
      updateMutation.mutate(formVal);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px', 
        gap: '1.5rem',
        color: '#a8a8a8', 
        fontSize: '0.85rem' 
      }}>
        <CloudSpinner size={72} />
        <span>Loading credentials...</span>
      </div>
    );
  }

  const getSafeAvatar = (path) => {
    if (!path || path.includes('..') || path.includes('defaultLogos')) {
      return '/icons/person.svg';
    }
    return path;
  };

  const infoFields = [
    { label: 'Username', value: user?.userName || 'Not set', key: 'username', isEditable: true },
    { label: 'Name', value: user ? `${user.firstName} ${user.lastName}` : 'Not set', key: 'name', isEditable: true },
    { label: 'Birthday', value: user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not set', key: 'dob', isEditable: true },
    { label: 'Gender', value: user?.gender || 'Not set', key: 'gender', isEditable: true },
  ];

  const contactFields = [
    { label: 'Email', value: user?.email || 'Not set', key: 'email', isEditable: false },
    { label: 'Phone Number', value: user?.phonenumber || 'Not set', key: 'phonenumber', isEditable: false },
    { label: 'Recovery Email', value: user?.recoveryEmail || 'Not set', key: 'recoveryEmail', isEditable: true },
  ];

  const layoutProps = {
    user,
    infoFields,
    contactFields,
    getSafeAvatar,
    handleEditClick,
    editField,
    formVal,
    selectedPreview,
    handleInputChange,
    handleFileChange,
    handleCloseModal,
    handleSubmit,
    isPending: updateMutation.isPending
  };

  // SSR / Hydration Fallback
  if (width === undefined) {
    return <PersonalInfoMobile {...layoutProps} />;
  }

  if (width >= 1024) {
    return <PersonalInfoDesktop {...layoutProps} />;
  }

  if (width >= 768) {
    return <PersonalInfoTablet {...layoutProps} />;
  }

  return <PersonalInfoMobile {...layoutProps} />;
}
