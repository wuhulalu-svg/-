// 修改后的 MainLayout.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Psychology as StrategyIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import StrategySettings from './StrategySettings';
import AppSettings from './AppSettings';
import MobileScheduleView from './MobileScheduleView';
import InspirationView from './InspirationView';
import InstallPrompt from './InstallPrompt';

export default function MainLayout() {
  const [selectedView, setSelectedView] = useState<'strategy' | 'schedule' | 'settings' | 'plan'>('plan');
  const [sidebarBackground, setSidebarBackground] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [loginBgImage, setLoginBgImage] = useState('');

  useEffect(() => {
    const savedSidebarBg = localStorage.getItem('sidebarBackgroundImage');
    const savedName = localStorage.getItem('userName');
    const savedAvatar = localStorage.getItem('userAvatar');
    const savedLoginBg = localStorage.getItem('loginBackgroundImage');

    if (savedSidebarBg) setSidebarBackground(savedSidebarBg);
    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
    if (savedLoginBg) setLoginBgImage(savedLoginBg);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedSidebarBg = localStorage.getItem('sidebarBackgroundImage');
      const savedLoginBg = localStorage.getItem('loginBackgroundImage');
      const savedName = localStorage.getItem('userName');
      const savedAvatar = localStorage.getItem('userAvatar');

      setSidebarBackground(savedSidebarBg || '');
      setLoginBgImage(savedLoginBg || '');
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

  const handleAddClick = () => {
    if (selectedView === 'plan') {
      window.dispatchEvent(new CustomEvent('openAddPlanDialog'));
    } else if (selectedView === 'strategy') {
      window.dispatchEvent(new CustomEvent('openAddStrategyDialog'));
    } else if (selectedView === 'schedule') {
      window.dispatchEvent(new CustomEvent('openAddInspirationItem'));
    } else {
      setSelectedView('plan');
      window.dispatchEvent(new CustomEvent('openAddPlanDialog'));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#FAFAFA', // 纯色背景，不再使用图片
        position: 'relative',
      }}
    >
      {/* Bottom Navigation Bar - 保持不变 */}
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

        {/* Center Add Button */}
        <Box
          onClick={handleAddClick}
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
            '&:hover': { bgcolor: '#444' },
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

      {/* Header for settings view only */}
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                我的
              </Typography>
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

      <InstallPrompt />
    </Box>
  );
}
