'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import axios from 'axios';
import styles from './categories.module.css';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CategoriesPage() {


  console.log("Exicuting JS .....");
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState(''); 
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleBFCache = (event) => {
      // Agar browser ne external site se aane par page ko freeze snapshot se load kiya hai
      if (event.persisted) {
        console.log("Frozen HTML Snapshot Detected! Forcing absolute reload...");
        window.location.reload(); // Pura browser fresh reload karega, JS zinda hogi
      }
    };

    // Ye window level par capture hoga, jab page show hoga
    window.addEventListener('pageshow', handleBFCache);

    return () => {
      window.removeEventListener('pageshow', handleBFCache);
    };
  }, []);

  // 1. React Query setup (Design & Caching logic)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/cloudbase/mediacategories/list');
      console.log(response.data.data.categories);
      
      return response.data.data.categories || response.data || [];
    },
    refetchOnMount: 'always', 
    staleTime: Infinity,

    // Memory State Fallback: Pehle se check karega ki memory state active hai ya nahi
    initialData: () => {
      return queryClient.getQueryData(['categories']);
    }
  });

  const categories = categoriesData || [];


  // 2. Automatic Slug Generator
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '') 
      .replace(/\s+/g, '-')        
      .replace(/-+/g, '-');        
      
    setSlug(generatedSlug);
  };

  // 3. Submit New Category to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    if (isLoading) return; 
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.post('/api/admin/category/addcategory', {
        name: name.trim(),
        description: description.trim(),
        slug: slug.trim()
      });

      setSuccessMsg('Category added successfully! 🎉');
      setName('');
      setDescription(''); 
      setSlug('');

      // FIX: Purane fetchCategories() ki jagah cache refresh automatic trigger hoga
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
    } catch (err) {
      console.error('Error adding category:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create category server error');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Delete Category Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`/api/admin/category/deletecategory/${id}`);
      
      // FIX: Cache refresh trigger on delete
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete category');
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div>
          <h1 className={styles.pageTitle}>Categories Manager</h1>
          <p className={styles.pageSubtitle}>Create and manage media collection groups</p>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column: Create Form */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Add New Category</h3>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              {errorMsg && <div style={{ color: '#ff4d4d', fontSize: '13px' }}>⚠️ {errorMsg}</div>}
              {successMsg && <div style={{ color: '#00ff66', fontSize: '13px' }}>✅ {successMsg}</div>}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Category Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Bollywood Movies"
                  value={name}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.input}
                  style={{ height: '80px', padding: '10px', resize: 'none' }}
                  placeholder="Enter category brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>URL Slug (Auto Generated)</label>
                <input
                  type="text"
                  className={`${styles.input} ${styles.disabledInput}`}
                  placeholder="bollywood-movies"
                  value={slug}
                  readOnly
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Save Category'}
              </button>
            </form>
          </div>

          {/* Right Column: Live List View */}
          <div className={styles.card}>
            {/* Frontend filter base counter logic */}
            <h3 className={styles.cardTitle}>
              Active Categories ({categories.filter(cat => cat.isActive === true).length})
            </h3>
            
            <div className={styles.listContainer}>
              {categories.filter(cat => cat.isActive === true).length === 0 ? (
                <p style={{ color: '#666666', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  No active categories found. Create one on the left!
                </p>
              ) : (
                categories
                  .filter(cat => cat.isActive === true) // FIX: Frontend-only filter active layers
                  .map((cat) => (
                    <div key={cat._id} className={styles.categoryItem}>
                      <div className={styles.itemInfo}>
                        <h4>{cat.name}</h4>
                        {cat.description && (
                          <p style={{ color: '#aaa', fontFamily: 'sans-serif', margin: '4px 0', fontSize: '13px' }}>
                            {cat.description}
                          </p>
                        )}
                        <p>slug: /{cat.slug}</p>
                      </div>
                      <div className={styles.actions}>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(cat._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}