import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, alpha, Dialog, DialogContent,
  TextField, Button, Checkbox, Slide, Snackbar, Alert, Slider, Paper, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import {
  Settings as SettingsIcon, Delete as DeleteIcon, AccessTime as TimeIcon,
  ChevronLeft, ChevronRight, CalendarToday as CalendarIcon, Info as InfoIcon,
} from '@mui/icons-material';

// ---------- 可拖拽缩放图片组件 ----------
interface ImageEditorProps {
  imageUrl: string;
  onUpdate: (settings: { scale: number; posX: number; posY: number; opacity: number }) => void;
  initialScale?: number;
  initialPosX?: number;
  initialPosY?: number;
  initialOpacity?: number;
}

function ImageEditor({ imageUrl, onUpdate, initialScale = 100, initialPosX = 50, initialPosY = 50, initialOpacity = 100 }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [posX, setPosX] = useState(initialPosX);
  const [posY, setPosY] = useState(initialPosY);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // 绘制预览
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const w = canvas.width = container.clientWidth;
      const h = canvas.height = container.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = opacity / 100;
      const imgW = img.width;
      const imgH = img.height;
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
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const scaleVal = scale / 100;
    const drawW = w * scaleVal;
    const drawH = h * scaleVal;
    const maxDeltaX = (w - drawW) / 2;
    const maxDeltaY = (h - drawH) / 2;
    let newPosX = posX + (dx / maxDeltaX) * 50;
    let newPosY = posY + (dy / maxDeltaY) * 50;
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

  return (
    <Box>
      <Box ref={containerRef} sx={{ width: '100%', height: 200, border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', cursor: 'grab', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>手指拖动移动图片，滚轮/捏合缩放</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <TextField type="range" label="缩放" value={scale} onChange={(e) => { const v = Number(e.target.value); setScale(v); onUpdate({ scale: v, posX, posY, opacity }); }} inputProps={{ min: 50, max: 200 }} fullWidth />
        <TextField type="range" label="透明度" value={opacity} onChange={(e) => { const v = Number(e.target.value); setOpacity(v); onUpdate({ scale, posX, posY, opacity: v }); }} inputProps={{ min: 0, max: 100 }} fullWidth />
      </Stack>
    </Box>
  );
}

// ---------- 圆形钟表组件（同前） ----------
function ClockPicker({ value, onChange }: { value: { hour: number; minute: number; period: 'AM' | 'PM' }; onChange: (t: any) => void }) {
  // ... 与之前相同，略
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

  // 背景设置状态：整体背景 + 顶部区域背景 + 计划列表背景
  const [globalBg, setGlobalBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [headerBg, setHeaderBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [planBoxBg, setPlanBoxBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });

  useEffect(() => {
    const saved = localStorage.getItem('dailyPlansV2');
    const savedGlobal = localStorage.getItem('planGlobalBg');
    const savedHeader = localStorage.getItem('planHeaderBg');
    const savedPlanBox = localStorage.getItem('planBoxBg');
    if (saved) setAllPlans(JSON.parse(saved));
    if (savedGlobal) setGlobalBg(JSON.parse(savedGlobal));
    if (savedHeader) setHeaderBg(JSON.parse(savedHeader));
    if (savedPlanBox) setPlanBoxBg(JSON.parse(savedPlanBox));
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyPlansV2', JSON.stringify(allPlans));
  }, [allPlans]);

  // 更新任意背景
  const updateBg = (type: 'global' | 'header' | 'planbox', newSettings: any) => {
    const key = type === 'global' ? 'planGlobalBg' : type === 'header' ? 'planHeaderBg' : 'planBoxBg';
    if (type === 'global') setGlobalBg(newSettings);
    else if (type === 'header') setHeaderBg(newSettings);
    else setPlanBoxBg(newSettings);
    localStorage.setItem(key, JSON.stringify(newSettings));
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

  const dateKey = selectedDate.toISOString().split('T')[0];
  const plans = allPlans[dateKey] || [];

  const addPlan = () => {
    if (!newPlanContent.trim()) return;
    const startStr = `${newPlanStart.hour}:${newPlanStart.minute.toString().padStart(2,'0')} ${newPlanStart.period}`;
    const endStr = `${newPlanEnd.hour}:${newPlanEnd.minute.toString().padStart(2,'0')} ${newPlanEnd.period}`;
    const newPlan = { id: Date.now().toString(), startTime: startStr, endTime: endStr, content: newPlanContent, completed: false };
    setAllPlans({ ...allPlans, [dateKey]: [...plans, newPlan].sort((a,b)=>a.startTime.localeCompare(b.startTime)) });
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
    <Box sx={{
      minHeight: '100%',
      backgroundImage: globalBg.url ? `url(${globalBg.url})` : 'none',
      backgroundSize: `${globalBg.scale}%`,
      backgroundPosition: `${globalBg.posX}% ${globalBg.posY}%`,
      backgroundRepeat: 'no-repeat',
      opacity: globalBg.opacity / 100,
      bgcolor: '#FAFAFA',
    }}>
      {/* 头部区域（含背景图片） */}
      <Box sx={{
        backgroundImage: headerBg.url ? `url(${headerBg.url})` : 'none',
        backgroundSize: `${headerBg.scale}%`,
        backgroundPosition: `${headerBg.posX}% ${headerBg.posY}%`,
        p: 2, borderBottom: '1px solid #f0f0f0', bgcolor: 'white'
      }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1} mb={2}>
          <IconButton size="small" onClick={() => setInfoOpen(true)}><InfoIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setSettingsOpen(true)}><SettingsIcon fontSize="small" /></IconButton>
        </Stack>
        {/* 日期导航等... 同前 */}
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
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: date.toDateString() === selectedDate.toDateString() ? '#333' : 'transparent', color: date.toDateString() === selectedDate.toDateString() ? 'white' : 'text.primary' }}>
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
          borderRadius: 3, p: 2, minHeight: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
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
            {plans.length === 0 && <Box sx={{ py: 8, textAlign: 'center', opacity: 0.5 }}>点击底部加号添加计划</Box>}
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

      {/* 背景设置对话框 - 支持三种背景，每个都有可视编辑 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={2}>⚙️ 背景设置</Typography>
          <RadioGroup defaultValue="global" sx={{ mb: 2 }}>
            <FormControlLabel value="global" control={<Radio />} label="整体背景" />
            <FormControlLabel value="header" control={<Radio />} label="顶部区域背景" />
            <FormControlLabel value="planbox" control={<Radio />} label="计划列表背景" />
          </RadioGroup>
          <Box sx={{ mt: 2 }}>
            {/* 这里需要根据选中的 Radio 动态显示对应的编辑器，为了简单，同时显示三个编辑器 */}
            <Typography variant="subtitle2">整体背景</Typography>
            {globalBg.url ? (
              <ImageEditor
                imageUrl={globalBg.url}
                onUpdate={(s) => updateBg('global', { ...globalBg, ...s })}
                initialScale={globalBg.scale} initialPosX={globalBg.posX} initialPosY={globalBg.posY} initialOpacity={globalBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth>上传整体背景图片<input type="file" hidden accept="image/*" onChange={handleBgUpload('global')} /></Button>
            )}
            <Typography variant="subtitle2" sx={{ mt: 3 }}>顶部区域背景</Typography>
            {headerBg.url ? (
              <ImageEditor
                imageUrl={headerBg.url}
                onUpdate={(s) => updateBg('header', { ...headerBg, ...s })}
                initialScale={headerBg.scale} initialPosX={headerBg.posX} initialPosY={headerBg.posY} initialOpacity={headerBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth>上传顶部背景图片<input type="file" hidden accept="image/*" onChange={handleBgUpload('header')} /></Button>
            )}
            <Typography variant="subtitle2" sx={{ mt: 3 }}>计划列表背景</Typography>
            {planBoxBg.url ? (
              <ImageEditor
                imageUrl={planBoxBg.url}
                onUpdate={(s) => updateBg('planbox', { ...planBoxBg, ...s })}
                initialScale={planBoxBg.scale} initialPosX={planBoxBg.posX} initialPosY={planBoxBg.posY} initialOpacity={planBoxBg.opacity}
              />
            ) : (
              <Button variant="outlined" component="label" fullWidth>上传列表背景图片<input type="file" hidden accept="image/*" onChange={handleBgUpload('planbox')} /></Button>
            )}
          </Box>
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

      {/* 完成任务 Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#4caf50', color: 'white' }}>{snackbarMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
