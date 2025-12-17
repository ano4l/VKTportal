import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const EmployeeProfilesView = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile/all');
      console.log('Fetched profiles:', response.data);
      setProfiles(response.data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      console.error('Error details:', error.response?.data);
      // Set empty array on error so UI shows "no profiles" message
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(searchLower) ||
      profile.email?.toLowerCase().includes(searchLower) ||
      profile.phone?.toLowerCase().includes(searchLower) ||
      profile.city?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white animate-pulse">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold text-white">Employee Profiles</h3>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input px-4 py-2 rounded-lg text-white w-full sm:w-64"
        />
      </div>

      <div className="grid gap-4">
        {filteredProfiles.length === 0 ? (
          <div className="glass-transparent rounded-xl p-8 text-center text-white/70">
            {searchTerm ? 'No employees found matching your search.' : profiles.length === 0 ? 'No employees have registered yet.' : 'No employees found matching your search.'}
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div
              key={profile.user_id}
              className="glass-card rounded-xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 glass rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {profile.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{profile.name || 'Unknown'}</h4>
                      <p className="text-white/70 text-sm">{profile.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/70">
                    {profile.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {profile.phone}
                      </div>
                    )}
                    {profile.city && (
                      <div>
                        <span className="font-medium">City:</span> {profile.city}
                      </div>
                    )}
                    {profile.date_of_birth && (
                      <div>
                        <span className="font-medium">Date of Birth:</span> {format(new Date(profile.date_of_birth), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {profile.user_created_at && (
                      <div>
                        <span className="font-medium">Joined:</span> {format(new Date(profile.user_created_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                  }}
                  className="glass-button px-4 py-2 text-white rounded-lg hover:scale-105 transition-all text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Employee Profile</h3>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="glass-transparent rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Name:</span>
                    <p className="text-white font-medium">{selectedProfile.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-white/70">Email:</span>
                    <p className="text-white font-medium">{selectedProfile.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-white/70">Phone:</span>
                    <p className="text-white font-medium">{selectedProfile.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-white/70">Date of Birth:</span>
                    <p className="text-white font-medium">
                      {selectedProfile.date_of_birth ? format(new Date(selectedProfile.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/70">ID Number:</span>
                    <p className="text-white font-medium">{selectedProfile.id_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-white/70">Tax Number:</span>
                    <p className="text-white font-medium">{selectedProfile.tax_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {(selectedProfile.address || selectedProfile.city || selectedProfile.postal_code || selectedProfile.country) && (
                <div className="glass-transparent rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {selectedProfile.address && (
                      <div className="sm:col-span-2">
                        <span className="text-white/70">Street Address:</span>
                        <p className="text-white font-medium">{selectedProfile.address}</p>
                      </div>
                    )}
                    {selectedProfile.city && (
                      <div>
                        <span className="text-white/70">City:</span>
                        <p className="text-white font-medium">{selectedProfile.city}</p>
                      </div>
                    )}
                    {selectedProfile.postal_code && (
                      <div>
                        <span className="text-white/70">Postal Code:</span>
                        <p className="text-white font-medium">{selectedProfile.postal_code}</p>
                      </div>
                    )}
                    {selectedProfile.country && (
                      <div>
                        <span className="text-white/70">Country:</span>
                        <p className="text-white font-medium">{selectedProfile.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {(selectedProfile.bank_name || selectedProfile.bank_account_number) && (
                <div className="glass-transparent rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Bank Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {selectedProfile.bank_name && (
                      <div>
                        <span className="text-white/70">Bank Name:</span>
                        <p className="text-white font-medium">{selectedProfile.bank_name}</p>
                      </div>
                    )}
                    {selectedProfile.bank_account_number && (
                      <div>
                        <span className="text-white/70">Account Number:</span>
                        <p className="text-white font-medium">{selectedProfile.bank_account_number}</p>
                      </div>
                    )}
                    {selectedProfile.bank_account_type && (
                      <div>
                        <span className="text-white/70">Account Type:</span>
                        <p className="text-white font-medium">{selectedProfile.bank_account_type}</p>
                      </div>
                    )}
                    {selectedProfile.branch_code && (
                      <div>
                        <span className="text-white/70">Branch Code:</span>
                        <p className="text-white font-medium">{selectedProfile.branch_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(selectedProfile.emergency_contact_name || selectedProfile.emergency_contact_phone) && (
                <div className="glass-transparent rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {selectedProfile.emergency_contact_name && (
                      <div>
                        <span className="text-white/70">Name:</span>
                        <p className="text-white font-medium">{selectedProfile.emergency_contact_name}</p>
                      </div>
                    )}
                    {selectedProfile.emergency_contact_phone && (
                      <div>
                        <span className="text-white/70">Phone:</span>
                        <p className="text-white font-medium">{selectedProfile.emergency_contact_phone}</p>
                      </div>
                    )}
                    {selectedProfile.emergency_contact_relationship && (
                      <div>
                        <span className="text-white/70">Relationship:</span>
                        <p className="text-white font-medium">{selectedProfile.emergency_contact_relationship}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="glass-button px-6 py-2 text-white rounded-lg hover:scale-105 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilesView;

