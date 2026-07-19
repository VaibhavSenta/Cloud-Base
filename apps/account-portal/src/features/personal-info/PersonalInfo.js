'use client';
import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../hooks/useSecureQuery';
import useWindowSize from '../../hooks/useWindowSize';
import api from '../../utils/api';
import { encryptPayload } from '../../utils/security/networkCrypto';
import PersonalInfoDesktop from './Desktop/PersonalInfoDesktop';
import PersonalInfoTablet from './Tablet/PersonalInfoTablet';
import PersonalInfoMobile from './Mobile/PersonalInfoMobile';
import styles from './PersonalInfo.module.css';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';

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
  const [rawImage, setRawImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const [isLandscape, setIsLandscape] = useState(false);

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
      const img = new window.Image();
      img.src = base64String;
      img.onload = () => {
        setIsLandscape(img.naturalWidth > img.naturalHeight);
        setRawImage(base64String);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCloseModal = () => {
    setEditField(null);
    setSelectedPreview(null);
    setFormVal({});
    setRawImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsLandscape(false);
  };

  const constrainPosition = (x, y, z) => {
    const imgEl = imgRef.current;
    if (!imgEl) return { x, y };

    const naturalWidth = imgEl.naturalWidth;
    const naturalHeight = imgEl.naturalHeight;
    if (!naturalWidth || !naturalHeight) return { x, y };

    let displayWidth, displayHeight;
    if (naturalWidth > naturalHeight) {
      displayHeight = 240;
      displayWidth = 240 * (naturalWidth / naturalHeight);
    } else {
      displayWidth = 240;
      displayHeight = 240 * (naturalHeight / naturalWidth);
    }

    const minX = 120 - (displayWidth * z) / 2;
    const maxX = (displayWidth * z) / 2 - 120;
    const minY = 120 - (displayHeight * z) / 2;
    const maxY = (displayHeight * z) / 2 - 120;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY)
    };
  };

  const cropImage = () => {
    if (!rawImage) return;
    const img = new window.Image();
    img.src = rawImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      // Calculate display dimensions based on aspect ratio cover/fit
      let displayWidth, displayHeight;
      if (img.naturalWidth > img.naturalHeight) {
        displayHeight = 240;
        displayWidth = 240 * (img.naturalWidth / img.naturalHeight);
      } else {
        displayWidth = 240;
        displayHeight = 240 * (img.naturalHeight / img.naturalWidth);
      }

      // Constrain position to prevent blank space in cropped canvas
      const constrained = constrainPosition(position.x, position.y, zoom);

      // Calculate display coordinate bounds with 50%-based centering offset
      const imageLeft = 120 + constrained.x - (displayWidth * zoom) / 2;
      const imageTop = 120 + constrained.y - (displayHeight * zoom) / 2;

      // Distance from image top-left to viewport (0, 0)
      const cropXDisplay = 0 - imageLeft;
      const cropYDisplay = 0 - imageTop;

      // Map display coordinate sizes to natural image dimensions
      const scaleFactor = img.naturalWidth / (displayWidth * zoom);

      const sx = cropXDisplay * scaleFactor;
      const sy = cropYDisplay * scaleFactor;
      const sWidth = 240 * scaleFactor;
      const sHeight = 240 * scaleFactor;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 300, 300);

      const base64String = canvas.toDataURL('image/png');
      setSelectedPreview(base64String);
      setFormVal({ profilePic: base64String });
      setRawImage(null); // Back to preview view
    };
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
    if (!path || path.includes('..') || path.includes('defaultLogos') || path === '/icons/person.svg' || path.includes('gravatar.com')) {
      return '/user-icon.png';
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
    isPending: updateMutation.isPending,
    rawImage,
    setRawImage,
    zoom,
    setZoom,
    position,
    setPosition,
    isDragging,
    setIsDragging,
    dragStart,
    setDragStart,
    imgRef,
    cropImage,
    isLandscape,
    constrainPosition
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
