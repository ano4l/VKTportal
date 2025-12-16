import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', date_of_birth: '', address: '', city: '', postal_code: '', country: 'South Africa', id_number: '', tax_number: '',
    bank_name: '', bank_account_number: '', bank_account_type: 'savings', branch_code: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('All fields are required');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        return true;
      case 2:
        if (!formData.phone || !formData.date_of_birth) {
          setError('Phone and date of birth are required');
          return false;
        }
        return true;
      case 3:
        if (!formData.bank_name || !formData.bank_account_number || !formData.branch_code) {
          setError('Bank name, account number, and branch code are required');
          return false;
        }
        return true;
      case 4:
        if (!formData.emergency_contact_name || !formData.emergency_contact_phone) {
          setError('Emergency contact name and phone are required');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    setError('');
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateStep(4)) return;
    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
      await axios.post('/api/profile/me', {
        phone: formData.phone, date_of_birth: formData.date_of_birth,
        address: formData.address, city: formData.city, postal_code: formData.postal_code, country: formData.country,
        bank_name: formData.bank_name, bank_account_number: formData.bank_account_number,
        bank_account_type: formData.bank_account_type, branch_code: formData.branch_code,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        id_number: formData.id_number, tax_number: formData.tax_number
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Account' },
    { number: 2, title: 'Personal' },
    { number: 3, title: 'Banking' },
    { number: 4, title: 'Emergency' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-3xl animate-scale-in">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8 animate-slide-in">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">VK</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">VirtuKey</h1>
            <p className="text-sm text-white/80">Employee Registration</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 animate-fade-in animate-delay-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'glass text-white scale-110'
                          : 'glass-transparent text-white/50'
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className="text-xs mt-2 text-white/80 hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                        currentStep > step.number ? 'glass' : 'glass-transparent'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="glass-card bg-gray-700/40 border-gray-600/50 text-gray-200 px-4 py-3 rounded-xl mb-6 animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => updateFormData('postal_code', e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={formData.id_number}
                      onChange={(e) => updateFormData('id_number', e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Tax Number</label>
                    <input
                      type="text"
                      value={formData.tax_number}
                      onChange={(e) => updateFormData('tax_number', e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-4">Banking Information</h3>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => updateFormData('bank_name', e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={formData.bank_account_number}
                    onChange={(e) => updateFormData('bank_account_number', e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Account Type</label>
                    <select
                      value={formData.bank_account_type}
                      onChange={(e) => updateFormData('bank_account_type', e.target.value)}
                      className="glass-input w-full px-4 py-3 rounded-xl text-white"
                    >
                      <option value="savings" className="bg-gray-800">Savings</option>
                      <option value="checking" className="bg-gray-800">Checking</option>
                      <option value="current" className="bg-gray-800">Current</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Branch Code</label>
                    <input
                      type="text"
                      value={formData.branch_code}
                      onChange={(e) => updateFormData('branch_code', e.target.value)}
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-4">Emergency Contact</h3>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => updateFormData('emergency_contact_phone', e.target.value)}
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => updateFormData('emergency_contact_relationship', e.target.value)}
                      placeholder="e.g., Spouse, Parent"
                      className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="glass-button px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
              >
                Back
              </button>
              {currentStep < 4 ? (
                <button
                  type="submit"
                  className="glass-button px-6 py-3 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/80">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-semibold hover:text-white/90 underline transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
