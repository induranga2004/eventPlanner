import * as React from 'react'
import { me } from "../api/auth";
import { buildNodeApiUrl } from "../config/api.js";
import { useNavigate, Link as RouterLink } from 'react-router-dom'
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
import { styled } from '@mui/material/styles'
import { motion } from 'motion/react'
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
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import TwoFactorSettings from '../components/TwoFactorSettings'

// Create Motion components
const MotionBox = motion.create(Box);
const MotionAvatar = motion.create(Avatar);

// Color Hunt styled components for Profile
const BackgroundContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1F316F 0%, #1A4870 50%, #1F316F 100%)',
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
    background: 'radial-gradient(circle at 50% 50%, rgba(91, 153, 194, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
}))

const GlassPaper = styled(MotionBox)(() => ({
  background: 'linear-gradient(135deg, rgba(26, 72, 112, 0.95) 0%, rgba(31, 49, 111, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  padding: '40px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  position: 'relative',
  zIndex: 1,
  flex: 1,
  width: '100%',
  maxWidth: '1100px',
  margin: '20px 0',
  textAlign: 'left',
}))

const FloatingAvatar = styled(MotionAvatar)(() => ({
  width: '120px',
  height: '120px',
  background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
  border: '3px solid rgba(91, 153, 194, 0.5)',
  backdropFilter: 'blur(10px)',
  margin: '0 auto 20px',
  transition: 'all 0.3s ease',
}))

const GradientText = styled(Typography)(() => ({
  color: '#F9DBBA',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '30px',
}))

const AIButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
  color: '#F9DBBA',
  border: '1px solid rgba(91, 153, 194, 0.4)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #1A4870 0%, #5B99C2 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(91, 153, 194, 0.4)',
  },
}))

const InfoBox = styled(MotionBox)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '16px',
  background: 'rgba(26, 72, 112, 0.6)',
  borderRadius: '12px',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  margin: '16px 0',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
}))

const DetailGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '25px',
  marginTop: '30px',
}))

const DetailCard = styled(MotionBox)(() => ({
  background: 'linear-gradient(135deg, rgba(26, 72, 112, 0.7) 0%, rgba(31, 49, 111, 0.7) 100%)',
  backdropFilter: 'blur(15px)',
  borderRadius: '16px',
  border: '1px solid rgba(91, 153, 194, 0.3)',
  padding: '25px',
  transition: 'all 0.3s ease',
}))

const LayoutWrapper = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '24px',
  maxWidth: '1500px',
  position: 'relative',
}))

const SideNav = styled(MotionBox)(() => ({
  minWidth: '220px',
  background: 'linear-gradient(180deg, rgba(26, 72, 112, 0.85) 0%, rgba(31, 49, 111, 0.85) 100%)',
  borderRadius: '18px',
  border: '1px solid rgba(91, 153, 194, 0.35)',
  padding: '28px 24px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
  backdropFilter: 'blur(18px)',
  position: 'sticky',
  top: '40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  color: '#F9DBBA',
}))

const NavHeading = styled(Typography)(() => ({
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontSize: '12px',
  color: 'rgba(249, 219, 186, 0.7)',
}))

const NavButton = styled(Button)(() => ({
  justifyContent: 'flex-start',
  gap: '12px',
  borderRadius: '12px',
  padding: '12px 16px',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.25) 0%, rgba(31, 49, 111, 0.45) 100%)',
  color: '#F9DBBA',
  border: '1px solid rgba(91, 153, 194, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(91, 153, 194, 0.35) 0%, rgba(31, 49, 111, 0.6) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 28px rgba(91, 153, 194, 0.35)',
  },
  '&.Mui-disabled': {
    background: 'rgba(91, 153, 194, 0.2)',
    color: 'rgba(249, 219, 186, 0.6)',
    border: '1px solid rgba(91, 153, 194, 0.25)',
  },
}))

const EditButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #5B99C2 0%, #1A4870 100%)',
  color: '#F9DBBA',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  padding: '12px 30px',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #1A4870 0%, #5B99C2 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(91, 153, 194, 0.4)',
  },
}))

const SectionTitle = styled(Typography)(() => ({
  color: '#F9DBBA',
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
    background: 'rgba(26, 72, 112, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(91, 153, 194, 0.3)',
    color: '#F9DBBA',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(26, 72, 112, 0.7)',
      border: '1px solid rgba(91, 153, 194, 0.5)',
    },
    '&.Mui-focused': {
      background: 'rgba(26, 72, 112, 0.8)',
      border: '1px solid #5B99C2',
      boxShadow: '0 0 20px rgba(91, 153, 194, 0.3)',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(249, 219, 186, 0.8)',
    '&.Mui-focused': {
      color: '#F9DBBA',
    }
  },
  '& .MuiInputBase-input': {
    color: '#F9DBBA',
  },
  '& .MuiOutlinedInput-input': {
    color: '#F9DBBA',
  }
}))

const AISelect = styled(FormControl)(() => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(26, 72, 112, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(91, 153, 194, 0.3)',
    color: '#F9DBBA',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      background: 'rgba(26, 72, 112, 0.7)',
    },
    '&.Mui-focused': {
      background: 'rgba(26, 72, 112, 0.8)',
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(249, 219, 186, 0.8)',
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
  const [storedRole] = React.useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userRole') : null))

  const dashboardConfig = React.useMemo(() => {
    const roleKey = (user?.role || storedRole || 'user').toLowerCase()

    const roleMap = {
  user: { path: '/user-dashboard', label: 'Event planner dashboard' },
      pro: { path: '/user-dashboard', label: 'Pro dashboard' },
      musician: { path: '/musician-dashboard', label: 'Musician dashboard' },
      musician_pro: { path: '/musician-dashboard', label: 'Musician Pro dashboard' },
      music_band: { path: '/music_band-dashboard', label: 'Music band dashboard' },
      venue: { path: '/venue-dashboard', label: 'Venue dashboard' },
      lights: { path: '/lights-dashboard', label: 'Lighting dashboard' },
      sounds: { path: '/sounds-dashboard', label: 'Sound dashboard' },
    }

    return roleMap[roleKey] || { path: '/user-dashboard', label: 'Main dashboard' }
  }, [storedRole, user?.role])

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
  const response = await fetch(buildNodeApiUrl('/api/auth/update-profile'), {
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
      <LayoutWrapper>
        <SideNav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <NavHeading>Quick access</NavHeading>
          <NavButton
            component={RouterLink}
            to={dashboardConfig.path}
            startIcon={<DashboardRoundedIcon />}
          >
            Back to {dashboardConfig.label}
          </NavButton>
          <NavButton
            component={RouterLink}
            to="/me"
            startIcon={<PersonOutlineRoundedIcon />}
            disabled
          >
            Profile overview
          </NavButton>
        </SideNav>

        <GlassPaper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <FloatingAvatar
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <PersonIcon sx={{ fontSize: 60, color: '#F9DBBA' }} />
        </FloatingAvatar>
        
        <GradientText variant="h4">
          Profile
        </GradientText>
        
        {error && (
          <Typography 
            sx={{ 
              mb: 3, 
              p: 2, 
              background: 'rgba(91, 153, 194, 0.2)', 
              border: '1px solid rgba(91, 153, 194, 0.4)',
              borderRadius: '8px',
              color: '#F9DBBA',
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
              <DetailCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <SectionTitle>Basic Information</SectionTitle>
                <DetailItem>
                  <PersonIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: '#F9DBBA', fontWeight: 500 }}>
                    ID: {user.id}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <EmailIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: '#F9DBBA', fontWeight: 500 }}>
                    Email: {user.email}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <WorkIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: '#F9DBBA', fontWeight: 500 }}>
                    Role: {user.role || 'Not specified'}
                  </Typography>
                </DetailItem>
              </DetailCard>

              {/* Contact Information Card */}
              <DetailCard
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <SectionTitle>Contact Information</SectionTitle>
                <DetailItem>
                  <PhoneIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: '#F9DBBA', fontWeight: 500 }}>
                    Phone: {user.phone || 'Not provided'}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <LocationOnIcon sx={{ color: '#5B99C2' }} />
                  <Typography sx={{ color: '#F9DBBA', fontWeight: 500 }}>
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
      </LayoutWrapper>

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
