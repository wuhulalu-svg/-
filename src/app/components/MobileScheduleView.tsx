import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, alpha, Dialog, DialogContent,
  TextField, Button, Checkbox, Slide, Snackbar, Alert, Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon, Delete as DeleteIcon, AccessTime as TimeIcon,
  ChevronLeft, ChevronRight, CalendarToday as CalendarIcon, Info as InfoIcon,
} from '@mui/icons-material';

// ---------- 圆形钟表组件（不变） ----------
function ClockPicker({ value, onChange }: { value: { hour: number; minute: number; period: 'AM' | 'PM' }; onChange: (t: any) => void }) {
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
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fef9e6';
    ctx.fill();
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = 1; i <= 12; i++) {
      let angle = (i * 30 - 90) * Math.PI / 180;
      let x = center + radius * 0.82 * Math.cos(angle);
      let y = center + radius * 0.82 * Math.sin(angle);
      ctx.fillStyle = '#5e3a1c';
      ctx.font = 'bold 18px "Segoe UI"';
      ctx.fillText(i.toString(), x - 7, y + 7);
    }
    let hourAngle = ((value.hour % 12) * 30 + value.minute * 0.5 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + radius * 0.5 * Math.cos(hourAngle), center + radius * 0.5 * Math.sin(hourAngle));
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#6366f1';
    ctx.stroke();
    let minuteAngle = (value.minute * 6 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + radius * 0.75 * Math.cos(minuteAngle), center + radius * 0.75 * Math.sin(minuteAngle));
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ec4899';
    ctx.stroke();
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
    let minute = Math.floor((dist / radius) * 60);
    minute = Math.min(59, Math.max(0, minute));
    onChange({ ...value, hour, minute });
  };

  const togglePeriod = () => {
    onChange({ ...value, period: value.period === 'AM' ? 'PM' : 'AM' });
  };

  return (
    <Stack alignItems="center" spacing={1}>
      <canvas ref={canvasRef} width={size} height={size} onClick={handleCanvasClick} style={{ cursor: 'pointer', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
      <Button variant="outlined" size="small" onClick={togglePeriod} sx={{ minWidth: 100 }}>
        切换 {value.period === 'AM' ? '上午 → 下午' : '下午 → 上午'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        当前：{value.hour}:{value.minute.toString().padStart(2,'0')} {value.period}
      </Typography>
    </Stack>
  );
}

// ---------- 图片编辑器（竖屏预览，拖拽/缩放/透明度只影响图片） ----------
function ImageEditor({ imageUrl, onUpdate, initialScale = 100, initialPosX = 50, initialPosY = 50, initialOpacity = 100 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [posX, setPosX] = useState(initialPosX);
  const [posY, setPosY] = useState(initialPosY);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // 绘制图片到 Canvas，透明度只在此生效（不影响页面内容）
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const w = canvas.width = container.clientWidth;
      const h = canvas.height = container.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity / 100;
      const scaleVal = scale / 100;
      const drawW = w * scaleVal;
      const drawH = h * scaleVal;
      const dx = (posX / 100) * (w - drawW);
      const dy = (posY / 100) * (h - drawH);
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.globalAlpha = 1;
    };
  }, [imageUrl, scale, posX, opacity]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const deltaX = (e.clientX - lastPos.current.x) * scaleX;
    const deltaY = (e.clientY - lastPos.current.y) * scaleY;
    const w = canvas.width;
    const h = canvas.height;
    const scaleVal = scale / 100;
    const drawW = w * scaleVal;
    const drawH = h * scaleVal;
    const maxDeltaX = (w - drawW) / 2;
    const maxDeltaY = (h - drawH) / 2;
    let newPosX = posX + (deltaX / maxDeltaX) * 50;
    let newPosY = posY + (deltaY / maxDeltaY) * 50;
    newPosX = Math.min(100, Math.max(0, newPosX));
    newPosY = Math.min(100, Math.max(0, newPosY));
    setPosX(newPosX);
    setPosY(newPosY);
    lastPos.current = { x: e.clientX, y: e.clientY };
    onUpdate({ scale, posX: newPosX, posY: newPosY, opacity });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -5 : 5;
    const newScale = Math.min(200, Math.max(50, scale + delta));
    setScale(newScale);
    onUpdate({ scale: newScale, posX, posY, opacity });
  };
  const handleOpacitySlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = Number(e.target.value);
    setOpacity(newOpacity);
    onUpdate({ scale, posX, posY, opacity: newOpacity });
  };
  const handleScaleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = Number(e.target.value);
    setScale(newScale);
    onUpdate({ scale: newScale, posX, posY, opacity });
  };

  return (
    <Box>
      <Box ref={containerRef} sx={{ width: 300, height: 400, margin: '0 auto', border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', cursor: 'grab' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel} />
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>鼠标拖拽移动图片，滚轮缩放</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">缩放 ({scale}%)</Typography>
          <input type="range" min={50} max={200} step={1} value={scale} onChange={handleScaleSlider} style={{ width: '100%' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">透明度 ({opacity}%)</Typography>
          <input type="range" min={0} max={100} step={1} value={opacity} onChange={handleOpacitySlider} style={{ width: '100%' }} />
        </Box>
      </Stack>
    </Box>
  );
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
  const [newPlanStart, setNewPlanStart] = useState({ hour: 9, minute: 0, period: 'AM' });
  const [newPlanEnd, setNewPlanEnd] = useState({ hour: 10, minute: 0, period: 'AM' });
  const [newPlanContent, setNewPlanContent] = useState('');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // 背景设置（独立图层，不影响内容）
  const [globalBg, setGlobalBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [headerBg, setHeaderBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [planBoxBg, setPlanBoxBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });

  useEffect(() => {
    const savedPlans = localStorage.getItem('dailyPlansV2');
    const savedGlobal = localStorage.getItem('planGlobalBg');
    const savedHeader = localStorage.getItem('planHeaderBg');
    const savedPlanBox = localStorage.getItem('planBoxBg');
    if (savedPlans) setAllPlans(JSON.parse(savedPlans));
    if (savedGlobal) setGlobalBg(JSON.parse(savedGlobal));
    if (savedHeader) setHeaderBg(JSON.parse(savedHeader));
    if (savedPlanBox) setPlanBoxBg(JSON.parse(savedPlanBox));
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlansV2', JSON.stringify(allPlans));
  }, [allPlans]);

  const updateBg = (type: 'global' | 'header' | 'planbox', newSettings: any) => {
    if (type === 'global') setGlobalBg(newSettings);
    else if (type === 'header') setHeaderBg(newSettings);
    else setPlanBoxBg(newSettings);
    localStorage.setItem(type === 'global' ? 'planGlobalBg' : type === 'header' ? 'planHeaderBg' : 'planBoxBg', JSON.stringify(newSettings));
  };

  const handleBgUpload = (type: 'global' | 'header' | 'planbox') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      updateBg(type, { url, scale: 100, posX: 50, posY: 50, opacity: 100 });
    };
    reader.readAsDataURL(file);
  };

  // 监听加号事件
  useEffect(() => {
    const handleOpenDialog = () => setDialogOpen(true);
    window.addEventListener('openAddPlanDialog', handleOpenDialog);
    return () => window.removeEventListener('openAddPlanDialog', handleOpenDialog);
  }, []);

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
    if (plan && !plan.completed) {
      setSnackbarMsg('主人，你真棒，又完成了一个任务呢~(*ˊ˘ˋ*)');
      setSnackbarOpen(true);
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
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      {/* 整体背景层（独立，透明度只影响图片） */}
      {globalBg.url && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${globalBg.url})`,
            backgroundSize: `${globalBg.scale}%`,
            backgroundPosition: `${globalBg.posX}% ${globalBg.posY}%`,
            backgroundRepeat: 'no-repeat',
            opacity: globalBg.opacity / 100,
            zIndex: 0,
          }}
        />
      )}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* 头部区域背景层 */}
        <Box
          sx={{
            backgroundImage: headerBg.url ? `url(${headerBg.url})` : 'none',
            backgroundSize: `${headerBg.scale}%`,
            backgroundPosition: `${headerBg.posX}% ${headerBg.posY}%`,
            p: 2,
            borderBottom: '1px solid #f0f0f0',
            bgcolor: 'white',
          }}
        >
          <Stack direction="row" justifyContent="flex-end" spacing={1} mb={2}>
            <IconButton size="small" onClick={() => setInfoOpen(true)}><InfoIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={() => setSettingsOpen(true)}><SettingsIcon fontSize="small" /></IconButton>
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

        <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="subtitle1" fontWeight={700}>≡ 目标和分类</Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Card sx={{
            backgroundImage: planBoxBg.url ? `url(${planBoxBg.url})` : 'none',
            backgroundSize: `${planBoxBg.scale}%`,
            backgroundPosition: `${planBoxBg.posX}% ${planBoxBg.posY}%`,
            borderRadius: 3,
            p: 2,
            minHeight: 400,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <Stack spacing={1.5}>
              {plans.map(plan => (
                <Paper key={plan.id} sx={{ p: 1.5, bgcolor: plan.completed ? alpha('#4caf50',0.1) : 'white', border: `1px solid ${plan.completed ? '#4caf50' : '#e0e0e0'}` }}>
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

        {/* 添加计划对话框 */}
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
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
          <DialogContent>
            <Typography variant="h6" fontWeight={700} mb={2}>⚙️ 背景设置</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>🌍 整体背景</Typography>
            {globalBg.url ? (
              <ImageEditor
                imageUrl={globalBg.url}
                onUpdate={(s) => updateBg('global', { ...globalBg, ...s })}
                initialScale={globalBg.scale} initialPosX={globalBg.posX} initialPosY={globalBg.posY} initialOpacity={globalBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>上传整体背景图片<input type="file" hidden accept="image/*" onChange={handleBgUpload('global')} /></Button>
            )}

            <Typography variant="subtitle2" sx={{ mt: 3 }}>📌 顶部区域背景</Typography>
            {headerBg.url ? (
              <ImageEditor
                imageUrl={headerBg.url}
                onUpdate={(s) => updateBg('header', { ...headerBg, ...s })}
                initialScale={headerBg.scale} initialPosX={headerBg.posX} initialPosY={headerBg.posY} initialOpacity={headerBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>上传顶部背景图片<input type="file" hidden accept="image/*" onChange={handleBgUpload('header')} /></Button>
            )}

            <Typography variant="subtitle2" sx={{ mt: 3 }}>📋 计划列表背景</Typography>
            {planBoxBg.url ? (
              <ImageEditor
                imageUrl={planBoxBg.url}
                onUpdate={(s) => updateBg('planbox', { ...planBoxBg, ...s })}
                initialScale={planBoxBg.scale} initialPosX={planBoxBg.posX} initialPosY={planBoxBg.posY} initialOpacity={planBoxBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>上传列表背景图片<input type="file" hidden accept="image/*" onChange={handleBgUpload('planbox')} /></Button>
            )}

            <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setSettingsOpen(false)}>完成</Button>
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
        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" sx={{ bgcolor: '#4caf50', color: 'white' }}>{snackbarMsg}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
