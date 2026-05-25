import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, alpha, Dialog, DialogContent,
  TextField, Button, Checkbox, Slide, Snackbar, Alert, Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon, Delete as DeleteIcon, AccessTime as TimeIcon,
  ChevronLeft, ChevronRight, CalendarToday as CalendarIcon, Info as InfoIcon,
} from '@mui/icons-material';

// 图片编辑器组件（保持不变）
function ImageEditor({ imageUrl, onUpdate, initialScale = 100, initialPosX = 50, initialPosY = 50, initialOpacity = 100 }) {
  // ... 内容与之前相同，为避免重复，这里省略，实际使用时请保留完整代码
  // 确保包含 handleChangeImage、滑块事件等
}

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
  const [infoOpen, setInfoOpen] = useState(false);
  const [newPlanStartTime, setNewPlanStartTime] = useState('09:00');
  const [newPlanEndTime, setNewPlanEndTime] = useState('10:00');
  const [newPlanContent, setNewPlanContent] = useState('');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // 实际背景
  const [headerBg, setHeaderBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [planBoxBg, setPlanBoxBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  // 临时编辑状态
  const [tempHeaderBg, setTempHeaderBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [tempPlanBoxBg, setTempPlanBoxBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });

  useEffect(() => {
    const savedPlans = localStorage.getItem('dailyPlansV2');
    const savedHeader = localStorage.getItem('planHeaderBg');
    const savedPlanBox = localStorage.getItem('planBoxBg');
    if (savedPlans) setAllPlans(JSON.parse(savedPlans));
    if (savedHeader) {
      const parsed = JSON.parse(savedHeader);
      setHeaderBg(parsed);
      setTempHeaderBg(parsed);
    }
    if (savedPlanBox) {
      const parsed = JSON.parse(savedPlanBox);
      setPlanBoxBg(parsed);
      setTempPlanBoxBg(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlansV2', JSON.stringify(allPlans));
  }, [allPlans]);

  const openSettings = () => {
    setTempHeaderBg({ ...headerBg });
    setTempPlanBoxBg({ ...planBoxBg });
    setSettingsOpen(true);
  };

  // 顶部背景：确定
  const applyHeaderBg = () => {
    setHeaderBg({ ...tempHeaderBg });
    localStorage.setItem('planHeaderBg', JSON.stringify(tempHeaderBg));
  };
  // 顶部背景：取消
  const cancelHeaderBg = () => {
    setTempHeaderBg({ ...headerBg });
  };

  // 计划列表背景：确定
  const applyPlanBoxBg = () => {
    setPlanBoxBg({ ...tempPlanBoxBg });
    localStorage.setItem('planBoxBg', JSON.stringify(tempPlanBoxBg));
  };
  // 计划列表背景：取消
  const cancelPlanBoxBg = () => {
    setTempPlanBoxBg({ ...planBoxBg });
  };

  const updateTempHeader = (updates: any) => {
    setTempHeaderBg({ ...tempHeaderBg, ...updates });
  };
  const updateTempPlanBox = (updates: any) => {
    setTempPlanBoxBg({ ...tempPlanBoxBg, ...updates });
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  useEffect(() => {
    const handleOpenDialog = () => setDialogOpen(true);
    window.addEventListener('openAddPlanDialog', handleOpenDialog);
    return () => window.removeEventListener('openAddPlanDialog', handleOpenDialog);
  }, []);

  const dateKey = selectedDate.toISOString().split('T')[0];
  const plans = allPlans[dateKey] || [];

  const addPlan = () => {
    if (!newPlanContent.trim()) return;
    const newPlan: Plan = {
      id: Date.now().toString(),
      startTime: newPlanStartTime,
      endTime: newPlanEndTime,
      content: newPlanContent,
      completed: false,
    };
    const updated = [...plans, newPlan].sort((a, b) => a.startTime.localeCompare(b.startTime));
    setAllPlans({ ...allPlans, [dateKey]: updated });
    setNewPlanContent('');
    setDialogOpen(false);
  };

  const togglePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (plan && !plan.completed) {
      setSnackbarMsg('主人，你真棒，又完成了一个任务呢~(*ˊ˘ˋ*)');
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 2000);
    }
    setAllPlans({ ...allPlans, [dateKey]: plans.map(p => p.id === id ? { ...p, completed: !p.completed } : p) });
  };

  const deletePlan = (id: string) => setAllPlans({ ...allPlans, [dateKey]: plans.filter(p => p.id !== id) });

  const changeDate = (offset: number) => {
    setSlideDirection(offset > 0 ? 'left' : 'right');
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const selectSpecificDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const currentDay = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
  const currentDateNum = selectedDate.getDate();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(currentDateNum + i - (currentDay - 1));
    return date;
  });

  return (
    <Box sx={{ position: 'relative', minHeight: '100%', bgcolor: '#FAFAFA' }}>
      {/* 头部区域 */}
      <Box sx={{ position: 'relative' }}>
        {headerBg.url && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${headerBg.url})`,
              backgroundSize: `${headerBg.scale}%`,
              backgroundPosition: `${headerBg.posX}% ${headerBg.posY}%`,
              backgroundRepeat: 'no-repeat',
              opacity: headerBg.opacity / 100,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}
        <Box sx={{ position: 'relative', zIndex: 1, p: 2, borderBottom: '1px solid #f0f0f0', bgcolor: 'transparent' }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mb={2}>
            <IconButton size="small" onClick={() => setInfoOpen(true)}><InfoIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={openSettings}><SettingsIcon fontSize="small" /></IconButton>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => changeDate(-1)}><ChevronLeft /></IconButton>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} onClick={() => setDatePickerOpen(true)} sx={{ cursor: 'pointer' }}>
                {selectedDate.getFullYear()}年{selectedDate.getMonth()+1}月{selectedDate.getDate()}日
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => changeDate(1)}><ChevronRight /></IconButton>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="space-between" mt={2}>
            {dates.map((date, idx) => (
              <Box key={idx} onClick={() => selectSpecificDate(date)} sx={{ textAlign: 'center', cursor: 'pointer' }}>
                <Typography variant="caption">{weekDays[idx]}</Typography>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: date.toDateString() === selectedDate.toDateString() ? '#333' : 'transparent',
                  color: date.toDateString() === selectedDate.toDateString() ? 'white' : 'text.primary',
                }}>
                  {date.getDate()}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
        <Typography variant="subtitle1" fontWeight={700}>≡ 目标和分类</Typography>
      </Box>

      {/* 计划列表区域 */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ position: 'relative' }}>
          {planBoxBg.url && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${planBoxBg.url})`,
                backgroundSize: `${planBoxBg.scale}%`,
                backgroundPosition: `${planBoxBg.posX}% ${planBoxBg.posY}%`,
                backgroundRepeat: 'no-repeat',
                opacity: planBoxBg.opacity / 100,
                borderRadius: 3,
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
          <Card sx={{
            position: 'relative',
            zIndex: 1,
            borderRadius: 3,
            p: 2,
            minHeight: 400,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            bgcolor: 'transparent',
          }}>
            <Stack spacing={1.5}>
              {plans.map(plan => (
                <Paper key={plan.id} sx={{ p: 1.5, bgcolor: plan.completed ? alpha('#4caf50',0.1) : 'rgba(255,255,255,0.9)', border: `1px solid ${plan.completed ? '#4caf50' : '#e0e0e0'}` }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox checked={plan.completed} onChange={() => togglePlan(plan.id)} size="small" />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: alpha('#6366f1',0.1), px: 1, py: 0.5, borderRadius: 2 }}>
                      <TimeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      <Typography variant="caption" fontWeight={600}>{plan.startTime} - {plan.endTime}</Typography>
                    </Stack>
                    <Typography sx={{ flex: 1, textDecoration: plan.completed ? 'line-through' : 'none', opacity: plan.completed ? 0.6 : 1 }}>{plan.content}</Typography>
                    <IconButton size="small" onClick={() => deletePlan(plan.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                  </Stack>
                </Paper>
              ))}
              {plans.length === 0 && (
                <Box sx={{ py: 8, textAlign: 'center', opacity: 0.5 }}>
                  <Typography variant="body2">点击底部加号添加计划</Typography>
                </Box>
              )}
            </Stack>
          </Card>
        </Box>
      </Box>

      {/* 添加计划对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={3}>📅 添加计划</Typography>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                type="time"
                label="开始时间"
                value={newPlanStartTime}
                onChange={(e) => setNewPlanStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <Typography variant="body2" color="text.secondary">—</Typography>
              <TextField
                type="time"
                label="结束时间"
                value={newPlanEndTime}
                onChange={(e) => setNewPlanEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Stack>
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
              <Button variant="contained" onClick={addPlan} disabled={!newPlanContent.trim()} sx={{ flex: 1, textTransform: 'none' }}>确定</Button>
              <Button variant="outlined" onClick={() => setDialogOpen(false)} sx={{ flex: 1, textTransform: 'none' }}>取消</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 日期选择对话框 */}
      <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="h6" mb={2}>选择日期</Typography>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => selectSpecificDate(new Date(e.target.value))}
            style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
          />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setDatePickerOpen(false)}>确定</Button>
        </DialogContent>
      </Dialog>

      {/* 背景设置对话框 */}
      <Dialog open={settingsOpen} onClose={closeSettings} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>⚙️ 背景设置</Typography>

          {/* 顶部区域背景 */}
          <Box sx={{ mb: 4, borderBottom: '1px solid #eee', pb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>顶部区域背景</Typography>
            {tempHeaderBg.url ? (
              <ImageEditor
                imageUrl={tempHeaderBg.url}
                onUpdate={updateTempHeader}
                initialScale={tempHeaderBg.scale}
                initialPosX={tempHeaderBg.posX}
                initialPosY={tempHeaderBg.posY}
                initialOpacity={tempHeaderBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                上传图片
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    updateTempHeader({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                  };
                  reader.readAsDataURL(file);
                }} />
              </Button>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={applyHeaderBg} sx={{ flex: 1 }}>确定</Button>
              <Button variant="outlined" onClick={cancelHeaderBg} sx={{ flex: 1 }}>取消</Button>
            </Stack>
          </Box>

          {/* 计划列表背景 */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>计划列表背景</Typography>
            {tempPlanBoxBg.url ? (
              <ImageEditor
                imageUrl={tempPlanBoxBg.url}
                onUpdate={updateTempPlanBox}
                initialScale={tempPlanBoxBg.scale}
                initialPosX={tempPlanBoxBg.posX}
                initialPosY={tempPlanBoxBg.posY}
                initialOpacity={tempPlanBoxBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                上传图片
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    updateTempPlanBox({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                  };
                  reader.readAsDataURL(file);
                }} />
              </Button>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={applyPlanBoxBg} sx={{ flex: 1 }}>确定</Button>
              <Button variant="outlined" onClick={cancelPlanBoxBg} sx={{ flex: 1 }}>取消</Button>
            </Stack>
          </Box>

          <Button variant="text" fullWidth sx={{ mt: 3 }} onClick={closeSettings}>关闭</Button>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>📝 做计划</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>记录每日任务，点击底部加号添加计划。勾选完成任务时有鼓励提示。</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setInfoOpen(false)}>知道啦</Button>
        </DialogContent>
      </Dialog>

      {/* 完成任务提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert severity="success" sx={{ bgcolor: '#4caf50', color: 'white' }}>{snackbarMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
