import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Card,
  alpha,
  Dialog,
  DialogContent,
  TextField,
  Button,
  Checkbox,
  Slide,
  Grid,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import TimePickerDialog from './TimePickerDialog';

interface Plan {
  id: string;
  startTime: string;
  endTime: string;
  content: string;
  completed: boolean;
}

export default function MobileScheduleView() {
  const [allPlans, setAllPlans] = useState<{ [date: string]: Plan[] }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');
  const [newPlanStartTime, setNewPlanStartTime] = useState('09:00');
  const [newPlanEndTime, setNewPlanEndTime] = useState('10:00');
  const [newPlanContent, setNewPlanContent] = useState('');
  const [headerBgImage, setHeaderBgImage] = useState('');
  const [planBoxBgImage, setPlanBoxBgImage] = useState('');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleOpenDialog = () => {
      setDialogOpen(true);
    };

    window.addEventListener('openAddPlanDialog', handleOpenDialog);
    return () => {
      window.removeEventListener('openAddPlanDialog', handleOpenDialog);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('dailyPlansV2');
    const savedHeaderBg = localStorage.getItem('planHeaderBgImage');
    const savedPlanBoxBg = localStorage.getItem('planBoxBgImage');

    if (saved) setAllPlans(JSON.parse(saved));
    if (savedHeaderBg) setHeaderBgImage(savedHeaderBg);
    if (savedPlanBoxBg) setPlanBoxBgImage(savedPlanBoxBg);
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlansV2', JSON.stringify(allPlans));
  }, [allPlans]);

  const dateKey = selectedDate.toISOString().split('T')[0];
  const plans = allPlans[dateKey] || [];

  const addPlan = () => {
    if (newPlanContent.trim()) {
      const newPlan: Plan = {
        id: Date.now().toString(),
        startTime: newPlanStartTime,
        endTime: newPlanEndTime,
        content: newPlanContent,
        completed: false,
      };

      const updatedPlans = [...plans, newPlan].sort((a, b) => a.startTime.localeCompare(b.startTime));
      setAllPlans({
        ...allPlans,
        [dateKey]: updatedPlans,
      });
      setNewPlanStartTime('09:00');
      setNewPlanEndTime('10:00');
      setNewPlanContent('');
      setDialogOpen(false);
    }
  };

  const changeDate = (offset: number) => {
    setSlideDirection(offset > 0 ? 'left' : 'right');
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const selectSpecificDate = (date: Date) => {
    const dayDiff = Math.floor((date.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24));
    setSlideDirection(dayDiff > 0 ? 'left' : 'right');
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  const togglePlan = (planId: string) => {
    const updatedPlans = plans.map(p =>
      p.id === planId ? { ...p, completed: !p.completed } : p
    );
    setAllPlans({
      ...allPlans,
      [dateKey]: updatedPlans,
    });
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    setAllPlans({
      ...allPlans,
      [dateKey]: updatedPlans,
    });
  };

  const handleHeaderBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setHeaderBgImage(result);
        localStorage.setItem('planHeaderBgImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlanBoxBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPlanBoxBgImage(result);
        localStorage.setItem('planBoxBgImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const currentDay = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
  const currentDate = selectedDate.getDate();

  const dates = Array.from({ length: 7 }, (_, i) => {
    const offset = i - (currentDay - 1);
    const date = new Date(selectedDate);
    date.setDate(currentDate + offset);
    return date;
  });

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddPlan = () => {
    setDialogOpen(true);
    handleAddMenuClose();
  };

  const handleAddInsiration = () => {
    // Trigger inspiration view
    window.dispatchEvent(new CustomEvent('openAddInspirationDialog'));
    handleAddMenuClose();
  };

  const handleAddStrategy = () => {
    // Trigger strategy view
    window.dispatchEvent(new CustomEvent('openAddStrategyDialog'));
    handleAddMenuClose();
  };

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100%' }}>
      {/* Header with background image */}
      <Box
        sx={{
          bgcolor: 'white',
          backgroundImage: headerBgImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${headerBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 2,
          borderBottom: '1px solid #f0f0f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={2}>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Date with navigation */}
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <IconButton size="small" onClick={() => changeDate(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Slide direction={slideDirection} in={true} key={selectedDate.toDateString()}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                  onClick={() => setDatePickerOpen(true)}
                >
                  {selectedDate.getFullYear()}年
                  <CalendarIcon sx={{ fontSize: 20 }} />
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                  onClick={() => setDatePickerOpen(true)}
                >
                  {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                </Typography>
              </Box>
            </Slide>
          </Box>
          <IconButton size="small" onClick={() => changeDate(1)}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        {/* Week Calendar - Clickable */}
        <Stack direction="row" spacing={1} justifyContent="space-between">
          {dates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <Box
                key={index}
                onClick={() => selectSpecificDate(date)}
                sx={{
                  textAlign: 'center',
                  minWidth: 42,
                  cursor: 'pointer',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {weekDays[index]}
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isSelected ? '#333' : 'transparent',
                    color: isSelected ? 'white' : 'text.primary',
                    fontWeight: isSelected ? 700 : 400,
                    mt: 0.5,
                    mx: 'auto',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: isSelected ? '#333' : alpha('#333', 0.1),
                    },
                  }}
                >
                  {date.getDate()}
                </Box>
                {isToday && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: '#FF6B9D',
                      mx: 'auto',
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Category Label */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          ≡ 目标和分类
        </Typography>
      </Box>

      {/* Single Plan Display Box */}
      <Box sx={{ p: 2 }}>
        <Card
          sx={{
            bgcolor: '#FFF',
            backgroundImage: planBoxBgImage ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${planBoxBgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid #E0E0E0',
            borderRadius: 3,
            p: 2,
            minHeight: 400,
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {/* Spiral binding effect */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: alpha('#000', 0.3),
                }}
              />
            ))}
          </Stack>

          {/* Plans List */}
          <Box sx={{ mt: 2 }}>
            {plans.length > 0 ? (
              <Stack spacing={1.5}>
                {plans.map((plan) => (
                  <Box
                    key={plan.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: plan.completed ? alpha('#4CAF50', 0.1) : alpha('#000', 0.02),
                      border: '1px solid',
                      borderColor: plan.completed ? '#4CAF50' : '#E0E0E0',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Checkbox
                        checked={plan.completed}
                        onChange={() => togglePlan(plan.id)}
                        size="small"
                        sx={{ p: 0 }}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: alpha('#6366f1', 0.1),
                          border: '1px solid',
                          borderColor: alpha('#6366f1', 0.3),
                        }}
                      >
                        <TimeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          {plan.startTime} - {plan.endTime}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          textDecoration: plan.completed ? 'line-through' : 'none',
                          opacity: plan.completed ? 0.6 : 1,
                        }}
                      >
                        {plan.content}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => deletePlan(plan.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: 300, opacity: 0.4 }}
              >
                <Box sx={{ fontSize: 60, mb: 2, opacity: 0.3 }}>📝</Box>
                <Typography variant="body2" color="text.secondary">
                  点击底部加号添加计划
                </Typography>
              </Stack>
            )}
          </Box>
        </Card>
      </Box>

      {/* Add Plan Dialog - Improved with Time Picker */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            ➕ 添加计划
          </Typography>

          <Stack spacing={2.5}>
            {/* Start Time */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                开始时间
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setTimePickerMode('start');
                  setTimePickerOpen(true);
                }}
                sx={{
                  justifyContent: 'center',
                  py: 1.5,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: 'primary.main',
                  }}
                >
                  {newPlanStartTime}
                </Typography>
              </Button>
            </Box>

            {/* End Time */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                结束时间
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setTimePickerMode('end');
                  setTimePickerOpen(true);
                }}
                sx={{
                  justifyContent: 'center',
                  py: 1.5,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'secondary.main',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: 'secondary.main',
                  }}
                >
                  {newPlanEndTime}
                </Typography>
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="计划内容"
              placeholder="输入计划内容..."
              value={newPlanContent}
              onChange={(e) => setNewPlanContent(e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => setDialogOpen(false)}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                取消
              </Button>
              <Button
                variant="contained"
                onClick={addPlan}
                disabled={!newPlanContent.trim()}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                添加
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Time Picker Dialog */}
      <TimePickerDialog
        open={timePickerOpen}
        title={timePickerMode === 'start' ? '选择开始时间' : '选择结束时间'}
        initialTime={timePickerMode === 'start' ? newPlanStartTime : newPlanEndTime}
        onClose={() => setTimePickerOpen(false)}
        onConfirm={(time) => {
          if (timePickerMode === 'start') {
            setNewPlanStartTime(time);
          } else {
            setNewPlanEndTime(time);
          }
        }}
      />

      {/* Date Picker Dialog */}
      <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            📅 选择日期
          </Typography>
          <Box>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                selectSpecificDate(newDate);
              }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #E0E0E0',
                fontFamily: 'inherit',
              }}
            />
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                selectSpecificDate(new Date());
              }}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              今天
            </Button>
            <Button
              variant="contained"
              onClick={() => setDatePickerOpen(false)}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              确定
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            ⚙️ 背景设置
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                顶部区域背景
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                {headerBgImage ? '更换背景图片' : '上传背景图片'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleHeaderBgUpload}
                />
              </Button>
              {headerBgImage && (
                <Box
                  sx={{
                    mt: 2,
                    height: 100,
                    borderRadius: 2,
                    backgroundImage: `url(${headerBgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #E0E0E0',
                  }}
                />
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                计划列表背景
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                {planBoxBgImage ? '更换背景图片' : '上传背景图片'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePlanBoxBgUpload}
                />
              </Button>
              {planBoxBgImage && (
                <Box
                  sx={{
                    mt: 2,
                    height: 100,
                    borderRadius: 2,
                    backgroundImage: `url(${planBoxBgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #E0E0E0',
                  }}
                />
              )}
            </Box>

            <Button
              variant="contained"
              onClick={() => setSettingsOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              完成
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Add Menu for bottom button */}
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
      >
        <MenuItem onClick={handleAddPlan} sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: 20 }}>📅</Box>
            <Typography>添加计划</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleAddInsiration} sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: 20 }}>💡</Box>
            <Typography>添加灵感</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleAddStrategy} sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontSize: 20 }}>🎯</Box>
            <Typography>添加策略</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
}
