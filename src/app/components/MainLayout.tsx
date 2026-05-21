import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Psychology as StrategyIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ScheduleView from './ScheduleView';
import StrategySettings from './StrategySettings';
import AppSettings from './AppSettings';
import MobileScheduleView from './MobileScheduleView';
import InspirationView from './InspirationView';
import InstallPrompt from './InstallPrompt';
import bgImage from '../../imports/7c92245cdcd6626a207319e0d96eee60.jpg';

export default function MainLayout() {
  const [selectedView, setSelectedView] = useState<'strategy' | 'schedule' | 'settings' | 'plan'>('plan');
  const [backgroundImage, setBackgroundImage] = useState<string>(bgImage);
  const [sidebarBackground, setSidebarBackground] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const savedBg = localStorage.getItem('appBackgroundImage');
    const savedSidebarBg = localStorage.getItem('sidebarBackgroundImage');
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');

    if (savedBg) setBackgroundImage(savedBg);
    if (savedSidebarBg) setSidebarBackground(savedSidebarBg);
    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedBg = localStorage.getItem('appBackgroundImage');
      const savedSidebarBg = localStorage.getItem('sidebarBackgroundImage');
      const savedLoginBg = localStorage.getItem('loginBackgroundImage');
      const savedName = localStorage.getItem('userName');
      const savedAvatar = localStorage.getItem('userAvatar');

      setBackgroundImage(savedBg || bgImage);
      setSidebarBackground(savedSidebarBg || '');
      setUserName(savedName || '');
      setUserAvatar(savedAvatar || '');
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddPlan = () => {
    setSelectedView('plan');
    const event = new CustomEvent('openAddPlanDialog');
    window.dispatchEvent(event);
    handleAddMenuClose();
  };

  const handleAddInsipration = () => {
    setSelectedView('schedule');
    const event = new CustomEvent('openAddInspirationDialog');
    window.dispatchEvent(event);
    handleAddMenuClose();
  };

  const handleAddStrategy = () => {
    setSelectedView('strategy');
    const event = new CustomEvent('openAddStrategyDialog');
    window.dispatchEvent(event);
    handleAddMenuClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        transition: 'background-image 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          zIndex: 0,
        }
      }}
    >
      {/* Bottom Navigation Bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          borderTop: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          px: 2,
        }}
      >
        <IconButton
          onClick={() => setSelectedView('plan')}
          sx={{
            flexDirection: 'column',
            gap: 0.5,
            color: selectedView === 'plan' ? '#333' : 'text.secondary',
            borderRadius: 2,
            px: 1.5,
          }}
        >
          <CalendarIcon />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: selectedView === 'plan' ? 600 : 400 }}>
            做计划
          </Typography>
        </IconButton>

        <IconButton
          onClick={() => setSelectedView('strategy')}
          sx={{
            flexDirection: 'column',
            gap: 0.5,
            color: selectedView === 'strategy' ? '#333' : 'text.secondary',
            borderRadius: 2,
            px: 1.5,
          }}
        >
          <StrategyIcon />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: selectedView === 'strategy' ? 600 : 400 }}>
            策略
          </Typography>
        </IconButton>

        {/* Center Add Button with Menu */}
        <Box
          onClick={handleAddMenuOpen}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#333',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: '#444',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Box>

        <IconButton
          onClick={() => setSelectedView('schedule')}
          sx={{
            flexDirection: 'column',
            gap: 0.5,
            color: selectedView === 'schedule' ? '#333' : 'text.secondary',
            borderRadius: 2,
            px: 1.5,
          }}
        >
          <Box component="span" sx={{ fontSize: 24 }}>💡</Box>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: selectedView === 'schedule' ? 600 : 400 }}>
            灵感
          </Typography>
        </IconButton>

        <IconButton
          onClick={() => setSelectedView('settings')}
          sx={{
            flexDirection: 'column',
            gap: 0.5,
            color: selectedView === 'settings' ? '#333' : 'text.secondary',
            borderRadius: 2,
            px: 1.5,
          }}
        >
          <Box component="span" sx={{ fontSize: 24 }}>😊</Box>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: selectedView === 'settings' ? 600 : 400 }}>
            我的
          </Typography>
        </IconButton>
      </Box>

      {/* Add Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }
        }}
      >
        <MenuItem 
          onClick={handleAddPlan}
          sx={{ 
            py: 1.5,
            px: 3,
            '&:hover': {
              bgcolor: alpha('#6366f1', 0.1),
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ fontSize: 24 }}>📅</Box>
            <Stack spacing={0.2}>
              <Typography sx={{ fontWeight: 600 }}>添加计划</Typography>
              <Typography variant="caption" color="text.secondary">需要设置时间</Typography>
            </Stack>
          </Box>
        </MenuItem>

        <MenuItem 
          onClick={handleAddInsipration}
          sx={{ 
            py: 1.5,
            px: 3,
            '&:hover': {
              bgcolor: alpha('#ec4899', 0.1),
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ fontSize: 24 }}>💡</Box>
            <Stack spacing={0.2}>
              <Typography sx={{ fontWeight: 600 }}>添加灵感</Typography>
              <Typography variant="caption" color="text.secondary">快速记录想法</Typography>
            </Stack>
          </Box>
        </MenuItem>

        <MenuItem 
          onClick={handleAddStrategy}
          sx={{ 
            py: 1.5,
            px: 3,
            '&:hover': {
              bgcolor: alpha('#06b6d4', 0.1),
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ fontSize: 24 }}>🎯</Box>
            <Stack spacing={0.2}>
              <Typography sx={{ fontWeight: 600 }}>添加策略</Typography>
              <Typography variant="caption" color="text.secondary">制定长期计划</Typography>
            </Stack>
          </Box>
        </MenuItem>
      </Menu>

      {/* Header - Only show for settings view */}
      {selectedView === 'settings' && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundImage: sidebarBackground ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${sidebarBackground})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box sx={{ p: 2 }}>
            {userAvatar || userName ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={userAvatar} sx={{ width: 40, height: 40 }}>
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {userName || '用户'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    我的
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  规划表
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  我的
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1, pb: 9 }}>
        {selectedView === 'plan' && <MobileScheduleView />}
        {selectedView === 'schedule' && <InspirationView />}
        {selectedView === 'strategy' && (
          <Box sx={{ p: 2 }}>
            <StrategySettings />
          </Box>
        )}
        {selectedView === 'settings' && (
          <Box sx={{ p: 2 }}>
            <AppSettings />
          </Box>
        )}
      </Box>

      {/* PWA 安装提示 */}
      <InstallPrompt />
    </Box>
  );
}
