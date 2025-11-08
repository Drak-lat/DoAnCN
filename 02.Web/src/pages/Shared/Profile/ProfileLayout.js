import React from 'react';
import ProfileComponent from '../../../components/Shared/Profile/ProfileComponent';

function ProfileLayout({ layoutType = 'customer' }) {
  if (layoutType === 'admin') {
    const AdminLayout = require('../../../components/Admin/AdminLayout/AdminLayout').default;
    return (
      <AdminLayout>
        <ProfileComponent />
      </AdminLayout>
    );
  }
  
  const Header = require('../../../components/Header/Header').default;
  return (
    <>
      <Header />
      <div style={{marginTop: '100px', padding: '20px', minHeight: '100vh', background: '#f8fafc'}}>
        <ProfileComponent />
      </div>
    </>
  );
}

export default ProfileLayout;