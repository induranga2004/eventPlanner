import * as React from 'react'
import { me } from "../api/auth";
import { useNavigate } from 'react-router-dom'
import { 
  Container, 
  CssBaseline, 
  Box, 
  Typography, 
  Button, 
  Avatar, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  OutlinedInput
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import PhoneIcon from '@mui/icons-material/Phone'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InfoIcon from '@mui/icons-material/Info'
import WorkIcon from '@mui/icons-material/Work'
import LanguageIcon from '@mui/icons-material/Language'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import GroupIcon from '@mui/icons-material/Group'
import EventIcon from '@mui/icons-material/Event'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import BuildIcon from '@mui/icons-material/Build'
import TwoFactorSettings from '../components/TwoFactorSettings'

// AI-themed animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

// AI-themed profile styled components
const BackgroundContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 8s ease infinite`,
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '20px',
  minWidth: '100vw',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
  }
}))

const GlassPaper = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 1,
  width: '95%',
  maxWidth: '1400px',
  margin: '20px auto',
  textAlign: 'left',
}))

const FloatingAvatar = styled(Avatar)(() => ({
  animation: `${float} 4s ease-in-out infinite`,
  width: '120px',
  height: '120px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
  border: '3px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  }
}))

const GradientText = styled(Typography)(() => ({
  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '30px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const AIButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0.2) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
  },
}))

const InfoBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  margin: '16px 0',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
  }
}))

const DetailGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '25px',
  marginTop: '30px',
}))

const DetailCard = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '25px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
  }
}))

const EditButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 30px',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
  },
}))

const SectionTitle = styled(Typography)(() => ({
  color: '#fff',
  fontWeight: 700,
  fontSize: '20px',
  marginBottom: '15px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}))

const DetailItem = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
  padding: '8px 0',
}))

const EditDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: '#fff',
    minWidth: '600px',
    maxWidth: '800px',
  }
}))

const AITextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0 20px rgba(79, 172, 254, 0.4)',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    '&.Mui-focused': {
      color: '#fff',
    }
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  '& .MuiOutlinedInput-input': {
    color: '#fff',
  }
}))

const AISelect = styled(FormControl)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.15)',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    '&.Mui-focused': {
      color: '#fff',
    }
  },
  '& .MuiSelect-select': {
    color: '#fff',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.8)',
  }
}))

export default function Profile() {
  const [user, setUser] = React.useState(null)
  const [error, setError] = React.useState('')
  const [editOpen, setEditOpen] = React.useState(false)
  const [editData, setEditData] = React.useState({})
  const [editLoading, setEditLoading] = React.useState(false)
  const [editError, setEditError] = React.useState('')
  const navigate = useNavigate()

  const handleEditProfile = () => {
    setEditData({ ...user })
    setEditOpen(true)
    setEditError('')
  }

  const handleCloseEdit = () => {
    setEditOpen(false)
    setEditData({})
    setEditError('')
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setEditLoading(true)
    setEditError('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setEditOpen(false)
        setEditData({})
      } else {
        const errorData = await response.json()
        setEditError(errorData.error || 'Failed to update profile')
      }
    } catch (err) {
      setEditError('Network error. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  React.useEffect(() => {
    async function load() {
      try {
        const data = await me()
        setUser(data.user)
      } catch (e) {
        setError('Unauthorized, please sign in')
        navigate('/login') // Redirect to login if unauthorized
      }
    }
    load()
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <BackgroundContainer>
      <CssBaseline />
      <GlassPaper>
        <FloatingAvatar>
          <PersonIcon sx={{ fontSize: 60, color: '#fff' }} />
        </FloatingAvatar>
        
        <GradientText variant="h4">
          Profile
        </GradientText>
        
        {error && (
          <Typography 
            sx={{ 
              mb: 3, 
              p: 2, 
              background: 'rgba(244, 67, 54, 0.1)', 
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              backdropFilter: 'blur(10px)',
            }}
          >
            {error}
          </Typography>
        )}
        
        {user ? (
          <Box>
            {/* Header with Edit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600 }}>
                Complete Profile Information
              </Typography>
              <EditButton startIcon={<EditIcon />} onClick={handleEditProfile}>
                Edit Profile
              </EditButton>
            </Box>

            {/* Basic Information Card */}
            <DetailGrid>
              <DetailCard>
                <SectionTitle>Basic Information</SectionTitle>
                <DetailItem>
                  <PersonIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    ID: {user.id}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <EmailIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Email: {user.email}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <WorkIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Role: {user.role || 'Not specified'}
                  </Typography>
                </DetailItem>
              </DetailCard>

              {/* Contact Information Card */}
              <DetailCard>
                <SectionTitle>Contact Information</SectionTitle>
                <DetailItem>
                  <PhoneIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Phone: {user.phone || 'Not provided'}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <LocationOnIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Address: {user.address || 'Not provided'}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <PersonIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Contact Person: {user.contactPerson || 'Not provided'}
                  </Typography>
                </DetailItem>
              </DetailCard>

              {/* Business Information Card */}
              {(user.role === 'sounds' || user.role === 'lights' || user.role === 'musician') && (
                <DetailCard>
                  <SectionTitle>Business Information</SectionTitle>
                  <DetailItem>
                    <BusinessIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Company: {user.companyName || 'Not provided'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <InfoIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Bio: {user.bio || 'Not provided'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <EventIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Experience: {user.experience ? `${user.experience} years` : 'Not provided'}
                    </Typography>
                  </DetailItem>
                </DetailCard>
              )}

              {/* Social Media Card */}
              <DetailCard>
                <SectionTitle>Online Presence</SectionTitle>
                <DetailItem>
                  <LanguageIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Website: {user.website || 'Not provided'}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <InstagramIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Instagram: {user.instagramLink || 'Not provided'}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <FacebookIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    Facebook: {user.facebookLink || 'Not provided'}
                  </Typography>
                </DetailItem>
              </DetailCard>

              {/* Role-specific Information */}
              {user.role === 'sounds' && (
                <DetailCard>
                  <SectionTitle>Sound Services Details</SectionTitle>
                  <DetailItem>
                    <BuildIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Equipment: {user.equipment || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <EventIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Event Types: {user.eventTypes || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <GroupIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Crew Size: {user.crewSize || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <InfoIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Services: {user.services || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <BuildIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Equipment Details: {user.equipmentDetails || 'Not provided'}
                    </Typography>
                  </DetailItem>
                </DetailCard>
              )}

              {user.role === 'lights' && (
                <DetailCard>
                  <SectionTitle>Lighting Services Details</SectionTitle>
                  <DetailItem>
                    <BuildIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Equipment: {user.equipment || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <EventIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Event Types: {user.eventTypes || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <GroupIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Crew Size: {user.crewSize || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <InfoIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Services: {user.services || 'Not specified'}
                    </Typography>
                  </DetailItem>
                </DetailCard>
              )}

              {user.role === 'musician' && (
                <DetailCard>
                  <SectionTitle>Musician Details</SectionTitle>
                  <DetailItem>
                    <MusicNoteIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Genre: {user.genre || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <BuildIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Instruments: {user.instruments || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <EventIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Event Types: {user.eventTypes || 'Not specified'}
                    </Typography>
                  </DetailItem>
                  <DetailItem>
                    <InfoIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      Performance Style: {user.performanceStyle || 'Not specified'}
                    </Typography>
                  </DetailItem>
                </DetailCard>
              )}
            </DetailGrid>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            {/* Two-Factor Authentication Settings */}
            <DetailCard sx={{ mt: 3 }}>
              <SectionTitle>Security Settings</SectionTitle>
              <TwoFactorSettings />
            </DetailCard>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <AIButton 
                onClick={logout} 
                startIcon={<ExitToAppIcon />}
                sx={{ fontSize: '16px', padding: '12px 30px' }}
              >
                Logout
              </AIButton>
            </Box>
          </Box>
        ) : (
          !error && (
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
              Loading…
            </Typography>
          )
        )}
      </GlassPaper>

      {/* Edit Profile Dialog */}
      <EditDialog open={editOpen} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <EditIcon />
          Edit Profile Information
        </DialogTitle>
        
        <DialogContent sx={{ background: 'rgba(0,0,0,0.2)', padding: 3 }}>
          {editError && (
            <Alert severity="error" sx={{ mb: 2, background: 'rgba(244,67,54,0.1)', color: '#fff' }}>
              {editError}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
            {/* Basic Information */}
            <AITextField
              label="Email"
              value={editData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              margin="normal"
              type="email"
            />
            
            <AITextField
              label="Phone"
              value={editData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              fullWidth
              margin="normal"
            />

            <AITextField
              label="Contact Person"
              value={editData.contactPerson || ''}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              fullWidth
              margin="normal"
            />

            {/* Business Information */}
            {(user?.role === 'sounds' || user?.role === 'lights' || user?.role === 'musician') && (
              <>
                <AITextField
                  label="Company Name"
                  value={editData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  fullWidth
                  margin="normal"
                />

                <AITextField
                  label="Experience (years)"
                  value={editData.experience || ''}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  fullWidth
                  margin="normal"
                  type="number"
                />

                <AITextField
                  label="Crew Size"
                  value={editData.crewSize || ''}
                  onChange={(e) => handleInputChange('crewSize', e.target.value)}
                  fullWidth
                  margin="normal"
                  type="number"
                />
              </>
            )}

            {/* Social Media */}
            <AITextField
              label="Website"
              value={editData.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              fullWidth
              margin="normal"
              type="url"
            />

            <AITextField
              label="Instagram"
              value={editData.instagramLink || ''}
              onChange={(e) => handleInputChange('instagramLink', e.target.value)}
              fullWidth
              margin="normal"
            />

            <AITextField
              label="Facebook"
              value={editData.facebookLink || ''}
              onChange={(e) => handleInputChange('facebookLink', e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>

          {/* Full-width fields */}
          <AITextField
            label="Address"
            value={editData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />

          <AITextField
            label="Bio"
            value={editData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          {/* Role-specific fields */}
          {(user?.role === 'sounds' || user?.role === 'lights') && (
            <>
              <AITextField
                label="Equipment Details"
                value={editData.equipmentDetails || ''}
                onChange={(e) => handleInputChange('equipmentDetails', e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                placeholder="Describe your equipment and inventory"
              />
              
              <AITextField
                label="Equipment Types (comma-separated)"
                value={editData.equipment || ''}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., PA Systems, Mixers, Speakers"
              />

              <AITextField
                label="Event Types (comma-separated)"
                value={editData.eventTypes || ''}
                onChange={(e) => handleInputChange('eventTypes', e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., Weddings, Corporate Events, Concerts"
              />

              <AITextField
                label="Services (comma-separated)"
                value={editData.services || ''}
                onChange={(e) => handleInputChange('services', e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., Sound System Setup, Live Sound Mixing"
              />
            </>
          )}

          {user?.role === 'musician' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
              <AITextField
                label="Genre"
                value={editData.genre || ''}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                fullWidth
                margin="normal"
              />
              
              <AITextField
                label="Instruments"
                value={editData.instruments || ''}
                onChange={(e) => handleInputChange('instruments', e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., Guitar, Piano, Drums"
              />

              <AITextField
                label="Performance Style"
                value={editData.performanceStyle || ''}
                onChange={(e) => handleInputChange('performanceStyle', e.target.value)}
                fullWidth
                margin="normal"
              />

              <AITextField
                label="Event Types (comma-separated)"
                value={editData.eventTypes || ''}
                onChange={(e) => handleInputChange('eventTypes', e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., Weddings, Corporate Events"
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          padding: 2,
          gap: 2
        }}>
          <Button
            onClick={handleCloseEdit}
            sx={{
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
              }
            }}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSaveProfile}
            disabled={editLoading}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: '#fff',
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }
            }}
            startIcon={editLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </EditDialog>
    </BackgroundContainer>
  )
}
