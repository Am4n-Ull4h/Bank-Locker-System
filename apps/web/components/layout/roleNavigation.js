// icon names from @mui/icons-material
const roleNavigation = {
  SUPER_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'Dashboard' },
    { label: 'Branches', path: '/admin/branches', icon: 'AccountBalance' },
    { label: 'Users', path: '/admin/users', icon: 'PeopleAlt' },
    { label: 'Reports', path: '/admin/reports', icon: 'BarChart' },
    { label: 'Profile', path: '/profile', icon: 'Person' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
  BRANCH_MANAGER: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'Dashboard' },
    { label: 'Lockers', path: '/manager/lockers', icon: 'Lock' },
    { label: 'Customers', path: '/manager/customers', icon: 'Group' },
    { label: 'Payments', path: '/manager/payments', icon: 'Payments' },
    { label: 'Requests', path: '/manager/requests', icon: 'Assignment' },
    { label: 'Profile', path: '/profile', icon: 'Person' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
  LOCKER_OFFICER: [
    { label: 'Dashboard', path: '/officer/dashboard', icon: 'Dashboard' },
    { label: 'Locker Access', path: '/officer/locker-access', icon: 'VpnKey' },
    { label: 'Allocations', path: '/officer/allocations', icon: 'AssignmentTurnedIn' },
    { label: 'Payments', path: '/officer/payments', icon: 'Payments' },
    { label: 'Profile', path: '/profile', icon: 'Person' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
  CUSTOMER: [
    { label: 'Dashboard', path: '/customer/dashboard', icon: 'Dashboard' },
    { label: 'My Locker', path: '/customer/my-locker', icon: 'Lock' },
    { label: 'Payments', path: '/customer/payments', icon: 'Payments' },
    { label: 'Requests', path: '/customer/requests', icon: 'ContactSupport' },
    { label: 'Profile', path: '/profile', icon: 'Person' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
};

export default roleNavigation;
