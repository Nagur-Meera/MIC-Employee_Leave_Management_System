import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '', // Optional employee ID
    name: '',
    email: '',
    password: 'employee123', // Default password
    role: 'employee',
    department: '',
    designation: '',
    qualification: '',
    mobileNo: '',
    dateOfBirth: '',
    dateOfJoining: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const departments = [
    'Bachelor of Education (BED)',
    'Civil Engineering (CIVIL)', 
    'Computer Science & Engineering (CSE)',
    'Artificial Intelligence Data Science & Machine Learning (AIDS & ML)',
    'Information Technology & Master of Computer Applications (IT & MCA)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering (MECH)'
  ];
  
  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setEmployees(response.data.data.users || []);
    } catch (error) {
      setEmployees([]);
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    // Password is always set to default, so no validation needed
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (!formData.designation || formData.designation.trim().length < 2) {
      errors.designation = 'Designation must be at least 2 characters';
    }
    if (!formData.qualification || formData.qualification.trim().length < 2) {
      errors.qualification = 'Qualification must be at least 2 characters';
    }
    if (!formData.mobileNo || !/^\d{10}$/.test(formData.mobileNo)) {
      errors.mobileNo = 'Valid 10-digit mobile number is required';
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errors = validateForm();
    setFormErrors(errors);
    
    console.log('Form validation errors:', errors);
    
    if (Object.keys(errors).length > 0) {
      console.log('Form has validation errors, not submitting');
      return;
    }
    
    try {
      // Always use the default password
      const submitData = { ...formData };
      submitData.password = 'employee123'; // Ensure password is always set to default
      
      // If employeeId is empty, remove it to let backend auto-generate it
      if (!submitData.employeeId || submitData.employeeId.trim() === '') {
        delete submitData.employeeId;
      }
      
      console.log('Submitting form data:', submitData);
      
      if (editingEmployee) {
        console.log(`Updating employee with ID ${editingEmployee._id}`);
        const response = await api.put(`/users/${editingEmployee._id}`, submitData);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating new employee');
        const response = await api.post('/auth/register', submitData);
        console.log('Create response:', response.data);
      }
      
      setShowAddModal(false);
      setEditingEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (error) {
      let msg = 'Error saving employee.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setSubmitError(msg);
      console.error('Error saving employee:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${employeeId}`);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId || '',
      name: employee.name,
      email: employee.email,
      password: 'employee123', // Default password
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      qualification: employee.qualification || '',
      mobileNo: employee.mobileNo,
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '', // Optional employee ID
      name: '',
      email: '',
      password: 'employee123', // Default password
      role: 'employee',
      department: '',
      designation: '',
      qualification: '',
      mobileNo: '',
      dateOfBirth: '',
      dateOfJoining: ''
    });
  };

  const filteredEmployees = (employees || []).filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesRole = !roleFilter || employee.role === roleFilter;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage all employees in the system</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="btn btn-primary btn-form"
        >
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="input"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('');
                  setRoleFilter('');
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Employee ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Department</th>
                  <th className="text-left py-3 px-4 font-semibold">Designation</th>
                  <th className="text-left py-3 px-4 font-semibold">Qualification</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredEmployees || []).map((employee) => (
                  <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{employee.employeeId}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.mobileNo}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{employee.email}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-secondary">{employee.department}</span>
                    </td>
                    <td className="py-3 px-4">{employee.designation}</td>
                    <td className="py-3 px-4">{employee.qualification}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${employee.role === 'admin' ? 'role-admin' : employee.role === 'hod' ? 'role-hod' : 'role-employee'}`}>
                        {employee.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No employees found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="input"
                    placeholder="Leave blank to auto-generate"
                  />
                  <p className="text-xs text-gray-500 mt-1">If left blank, system will auto-generate ID</p>
                </div>
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                  />
                  {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input"
                  />
                  {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                </div>
                {/* Password field hidden with default value of employee123 */}
                <div>
                  <label className="label">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {formErrors.department && <p className="error-message">{formErrors.department}</p>}
                </div>
                <div>
                  <label className="label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="hod">HOD</option>
                    <option value="employee">Employee</option>
                  </select>
                  {formErrors.role && <p className="error-message">{formErrors.role}</p>}
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="input"
                  />
                  {formErrors.designation && <p className="error-message">{formErrors.designation}</p>}
                </div>
                <div>
                  <label className="label">Qualification</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="input"
                  />
                  {formErrors.qualification && <p className="error-message">{formErrors.qualification}</p>}
                </div>
                <div>
                  <label className="label">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNo}
                    onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                    className="input"
                    maxLength="10"
                  />
                  {formErrors.mobileNo && <p className="error-message">{formErrors.mobileNo}</p>}
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="input"
                  />
                  {formErrors.dateOfBirth && <p className="error-message">{formErrors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="label">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="btn btn-outline btn-form"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-form">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;