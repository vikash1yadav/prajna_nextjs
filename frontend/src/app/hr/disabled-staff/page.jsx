'use client';

import React from 'react';
import StaffDirectoryPage from '../staff/page.jsx';

export default function DisabledStaffPage() {
  return <StaffDirectoryPage forceDisabled={true} />;
}
