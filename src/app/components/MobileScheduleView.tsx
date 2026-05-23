import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, alpha, Dialog, DialogContent,
  TextField, Button, Checkbox, Slide, Snackbar, Alert, Slider, Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon, Delete as DeleteIcon, AccessTime as TimeIcon,
  ChevronLeft, ChevronRight, CalendarToday as CalendarIcon, Info as InfoIcon,
} from '@mui/icons-material';

interface Plan {
  id: string;
  startTime: string;
  endTime: string;
  content: string;
  completed: boolean;
}

interface TimeState {
  hour: number;   // 1-12
  minute: number; // 0-59
  period: 'AM' | 'PM';
}

// 圆形钟表组件
function ClockPicker({ value, onChange }: { value: TimeState; onChange: (t: TimeState) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 220;
  const center = size / 2;
  const radius = size * 0.4;

  useEffect(() => {
    drawClock();
  }, [value]);

  const drawClock = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    // 表盘
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef9e6';
    ctx.fill();
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 刻度数字
    for (let i = 1; i <= 12; i++) {
      let angle = (i * 30 - 90) * Math.PI / 180;
      let x = center + radius * 0.82 * Math.cos(angle);
      let y = center + radius * 0.82 * Math.sin(angle);
      ctx.fillStyle = '#5e3a1c';
      ctx.font = 'bold 18px "Segoe UI"';
      ctx.fillText(i.toString(), x - 7, y + 7);
    }
    // 时针
    let hourAngle = ((value.hour % 12) * 30 + value.minute * 0.5 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + radius * 0.5 * Math.cos(hourAngle), center + radius * 0.5 * Math.sin(hourAngle));
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#6366f1';
    ctx.stroke();
    // 分针
    let minuteAngle = (value.minute * 6 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + radius * 0.75 * Math.cos(minuteAngle), center + radius * 0.75 * Math.sin(minuteAngle));
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ec4899';
    ctx.stroke();
    // 中心点
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const dx = mouseX - center;
    const dy = mouseY - center;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) return;
    let angle = Math.atan2(dy, dx) + Math.PI/2;
    if (angle < 0) angle += 2*Math.PI;
    let hour = Math.round(angle / (Math.PI/6)) % 12;
    if (hour === 0) hour = 12;
    // 分针由距离决定（简单模拟）
    let minute = Math.floor((dist / radius) * 60);
    minute = Math.min(59, Math.max(0, minute));
    onChange({ ...value, hour, minute });
  };

  const changePeriod = () => {
    onChange({ ...value, period: value.period === 'AM' ? 'PM' : 'AM' });
  };

  return (
    <Stack alignItems="center" spacing={1}>
      <canvas ref={canvasRef} width={size} height={size} onClick={handleCanvasClick} style={{ cursor: 'pointer', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
      <Button variant="outlined" size="small" onClick={changePeriod} sx={{ minWidth: 100 }}>
        切换 {value.period === 'AM' ? '上午 → 下午' : '下午 → 上午'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        当前：{value.hour}:{value.minute.toString().padStart(2,'0')} {value.period}
      </Typography>
    </Stack>
  );
}

export default function MobileScheduleView() {
  const [allPlans, setAllPlans] = useState<{ [date: string]: Plan[] }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [newPlanStart, setNewPlanStart] = useState<TimeState>({ hour: 9, minute: 0, period: 'AM' });
  const [newPlanEnd, setNewPlanEnd] = useState<TimeState>({ hour: 10, minute: 0, period: 'AM' });
  const [newPlanContent, setNewPlanContent] = useState('');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  
  // 背景设置状态
  const [headerBgSettings, setHeaderBgSettings] = useState({ url: '', scale: 100, posX: 50, posY: 50 });
  const [planBoxBgSettings, setPlanBoxBgSettings] = useState({ url: '', scale: 100, posX: 50, posY: 50 });

  useEffect(() => {
    const savedPlans = localStorage.getItem('dailyPlansV2');
    const savedHeader = localStorage.getItem('planHeaderBgSettings');
    const savedPlanBox = localStorage.getItem('planBoxBgSettings');
    if (savedPlans) setAllPlans(JSON.parse(savedPlans));
    if (savedHeader) setHeaderBgSettings(JSON.parse(savedHeader));
    if (savedPlanBox) setPlanBoxBgSettings(JSON.parse(savedPlanBox));
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlansV2', JSON.stringify(allPlans));
  }, [allPlans]);

  const dateKey = selectedDate.toISOString().split('T')[0];
  const plans = allPlans[dateKey] || [];

  const addPlan = () => {
    if (!newPlanContent.trim()) return;
    const startStr = `${newPlanStart.hour}:${newPlanStart.minute.toString().padStart(2,'0')} ${newPlanStart.period}`;
    const endStr = `${newPlanEnd.hour}:${newPlanEnd.minute.toString().padStart(2,'0')} ${newPlanEnd.period}`;
    const newPlan: Plan = {
      id: Date.now().toString(),
      startTime: startStr,
      endTime: endStr,
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
    if (!plan) return;
    if (!plan.completed) {
      setSnackbarMsg('主人，你真棒，又完成了一个任务呢~(*ˊ˘ˋ*)');
      setSnackbarOpen(true);
    }
    const updated = plans.map(p => p.id === id ? { ...p, completed: !p.completed } : p);
    setAllPlans({ ...allPlans, [dateKey]: updated });
  };

  const deletePlan = (id: string) => {
    setAllPlans({ ...allPlans, [dateKey]: plans.filter(p => p.id !== id) });
  };

  const changeDate = (offset: number) => {
    setSlideDirection(offset > 0 ? 'left' : 'right');
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const selectSpecificDate = (date: Date) => {
    const diff = Math.floor((date.getTime() - selectedDate.getTime()) / (1000*3600*24));
    setSlideDirection(diff > 0 ? 'left' : 'right');
    setSelectedDate(date);
    setDatePickerOpen(false);
  };

  const handleBgUpload = (type: 'header' | 'planbox') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const settings = { url, scale: 100, posX: 50, posY: 50 };
      if (type === 'header') {
        setHeaderBgSettings(settings);
        localStorage.setItem('planHeaderBgSettings', JSON.stringify(settings));
      } else {
        setPlanBoxBgSettings(settings);
        localStorage.setItem('planBoxBgSettings', JSON.stringify(settings));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateBgSetting = (type: 'header' | 'planbox', key: string, val: number) => {
    if (type === 'header') {
      const newSettings = { ...headerBgSettings, [key]: val };
      setHeaderBgSettings(newSettings);
      localStorage.setItem('planHeaderBgSettings', JSON.stringify(newSettings));
    } else {
      const newSettings = { ...planBoxBgSettings, [key]: val };
      setPlanBoxBgSettings(newSettings);
      localStorage.setItem('planBoxBgSettings', JSON.stringify(newSettings));
    }
  };

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const currentDay = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
  const currentDateNum = selectedDate.getDate();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const offset = i - (currentDay - 1);
    const date = new Date(selectedDate);
    date.setDate(currentDateNum + offset);
    return date;
  });

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100%' }}>
      {/* 头部区域（含背景图片） */}
      <Box
        sx={{
          bgcolor: 'white',
          backgroundImage: headerBgSettings.url ? `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${headerBgSettings.url})` : 'none',
          backgroundSize: `${headerBgSettings.scale}%`,
          backgroundPosition: `${headerBgSettings.posX}% ${headerBgSettings.posY}%`,
          backgroundRepeat: 'no-repeat',
          p: 2,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Stack direction="row" justifyContent="flex-end" spacing={1} mb={2}>
          <IconButton size="small" onClick={() => setInfoOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', boxShadow: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', boxShadow: 1 }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
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
          {dates.map((date, idx) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <Box key={idx} onClick={() => selectSpecificDate(date)} sx={{ textAlign: 'center', cursor: 'pointer' }}>
                <Typography variant="caption" color="text.secondary">{weekDays[idx]}</Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isSelected ? '#333' : 'transparent', color: isSelected ? 'white' : 'text.primary', fontWeight: isSelected ? 700 : 400, mx: 'auto' }}>
                  {date.getDate()}
                </Box>
                {isToday && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#FF6B9D', mx: 'auto' }} />}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
        <Typography variant="subtitle1" fontWeight={700}>≡ 目标和分类</Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Card sx={{
          bgcolor: '#FFF',
          backgroundImage: planBoxBgSettings.url ? `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${planBoxBgSettings.url})` : 'none',
          backgroundSize: `${planBoxBgSettings.scale}%`,
          backgroundPosition: `${planBoxBgSettings.posX}% ${planBoxBgSettings.posY}%`,
          borderRadius: 3, p: 2, minHeight: 400, position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Stack spacing={1.5}>
            {plans.length ? plans.map(plan => (
              <Paper key={plan.id} sx={{ p: 1.5, bgcolor: plan.completed ? alpha('#4caf50',0.1) : alpha('#000',0.02), border: `1px solid ${plan.completed ? '#4caf50' : '#e0e0e0'}` }}>
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
            )) : (
              <Box sx={{ py: 8, textAlign: 'center', opacity: 0.5 }}>
                <Typography variant="body2">点击底部加号添加计划</Typography>
              </Box>
            )}
          </Stack>
        </Card>
      </Box>

      {/* 添加计划对话框 - 钟表选择器 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={2}>📅 添加计划</Typography>
          <Stack spacing={3}>
            <Typography variant="subtitle2">开始时间</Typography>
            <ClockPicker value={newPlanStart} onChange={setNewPlanStart} />
            <Typography variant="subtitle2">结束时间</Typography>
            <ClockPicker value={newPlanEnd} onChange={setNewPlanEnd} />
            <TextField multiline rows={3} label="计划内容" value={newPlanContent} onChange={e => setNewPlanContent(e.target.value)} fullWidth />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => setDialogOpen(false)} sx={{ flex: 1 }}>取消</Button>
              <Button variant="contained" onClick={addPlan} disabled={!newPlanContent.trim()} sx={{ flex: 1 }}>添加</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 日期选择对话框 */}
      <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="h6" mb={2}>选择日期</Typography>
          <input type="date" value={selectedDate.toISOString().split('T')[0]} onChange={e => selectSpecificDate(new Date(e.target.value))} style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }} />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setDatePickerOpen(false)}>确定</Button>
        </DialogContent>
      </Dialog>

      {/* 背景设置对话框 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={3}>⚙️ 背景设置</Typography>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>顶部区域背景</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>{headerBgSettings.url ? '更换图片' : '上传图片'}<input type="file" hidden accept="image/*" onChange={handleBgUpload('header')} /></Button>
              {headerBgSettings.url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption">缩放: {headerBgSettings.scale}%</Typography>
                  <Slider value={headerBgSettings.scale} onChange={(_, v) => updateBgSetting('header', 'scale', v as number)} min={50} max={200} />
                  <Typography variant="caption">水平位置</Typography>
                  <Slider value={headerBgSettings.posX} onChange={(_, v) => updateBgSetting('header', 'posX', v as number)} min={0} max={100} />
                  <Typography variant="caption">垂直位置</Typography>
                  <Slider value={headerBgSettings.posY} onChange={(_, v) => updateBgSetting('header', 'posY', v as number)} min={0} max={100} />
                  <Box sx={{ height: 80, mt: 1, borderRadius: 2, backgroundImage: `url(${headerBgSettings.url})`, backgroundSize: `${headerBgSettings.scale}%`, backgroundPosition: `${headerBgSettings.posX}% ${headerBgSettings.posY}%`, border: '1px solid #ddd' }} />
                </Box>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>计划列表背景</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>{planBoxBgSettings.url ? '更换图片' : '上传图片'}<input type="file" hidden accept="image/*" onChange={handleBgUpload('planbox')} /></Button>
              {planBoxBgSettings.url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption">缩放: {planBoxBgSettings.scale}%</Typography>
                  <Slider value={planBoxBgSettings.scale} onChange={(_, v) => updateBgSetting('planbox', 'scale', v as number)} min={50} max={200} />
                  <Typography variant="caption">水平位置</Typography>
                  <Slider value={planBoxBgSettings.posX} onChange={(_, v) => updateBgSetting('planbox', 'posX', v as number)} min={0} max={100} />
                  <Typography variant="caption">垂直位置</Typography>
                  <Slider value={planBoxBgSettings.posY} onChange={(_, v) => updateBgSetting('planbox', 'posY', v as number)} min={0} max={100} />
                  <Box sx={{ height: 80, mt: 1, borderRadius: 2, backgroundImage: `url(${planBoxBgSettings.url})`, backgroundSize: `${planBoxBgSettings.scale}%`, backgroundPosition: `${planBoxBgSettings.posX}% ${planBoxBgSettings.posY}%`, border: '1px solid #ddd' }} />
                </Box>
              )}
            </Box>
            <Button variant="contained" onClick={() => setSettingsOpen(false)}>完成</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>📝 做计划</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>在这里记录每日任务，点击底部加号添加计划。勾选完成任务时会有鼓励提示哦~</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setInfoOpen(false)}>知道啦</Button>
        </DialogContent>
      </Dialog>

      {/* 完成任务的 Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#4caf50', color: 'white' }}>{snackbarMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
