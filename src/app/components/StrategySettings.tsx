import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Collapse, alpha,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandMore, ExpandLess, Settings as SettingsIcon, Info as InfoIcon,
  FitnessCenter, Restaurant, Psychology, Schedule,
} from '@mui/icons-material';

// ---------- 图片编辑器（支持触摸拖动、缩放、透明度） ----------
function ImageEditor({ imageUrl, onUpdate, initialScale = 100, initialPosX = 50, initialPosY = 50, initialOpacity = 100 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [posX, setPosX] = useState(initialPosX);
  const [posY, setPosY] = useState(initialPosY);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

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

  const startDrag = (clientX, clientY) => {
    setIsDragging(true);
    lastPos.current = { x: clientX, y: clientY };
  };
  const onDrag = (clientX, clientY) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const deltaX = (clientX - lastPos.current.x) * scaleX;
    const deltaY = (clientY - lastPos.current.y) * scaleY;
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
    lastPos.current = { x: clientX, y: clientY };
    onUpdate({ scale, posX: newPosX, posY: newPosY, opacity });
  };
  const endDrag = () => setIsDragging(false);

  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e) => onDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onDrag(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    endDrag();
  };

  const handleScaleSlider = (e) => {
    const newScale = Number(e.target.value);
    setScale(newScale);
    onUpdate({ scale: newScale, posX, posY, opacity });
  };
  const handleOpacitySlider = (e) => {
    const newOpacity = Number(e.target.value);
    setOpacity(newOpacity);
    onUpdate({ scale, posX, posY, opacity: newOpacity });
  };

  const handleChangeImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newUrl = ev.target?.result as string;
        setScale(100);
        setPosX(50);
        setPosY(50);
        setOpacity(100);
        onUpdate({ url: newUrl, scale: 100, posX: 50, posY: 50, opacity: 100 });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <Box>
      <Box ref={containerRef} sx={{ width: 300, height: 400, margin: '0 auto', border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
        手指拖动移动图片，下方滑块缩放/透明度
      </Typography>
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
      <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }} onClick={handleChangeImage}>
        更换图片
      </Button>
    </Box>
  );
}

interface Strategy {
  id: string;
  title: string;
  content: string;
  expanded: boolean;
}

const icons: { [key: string]: any } = {
  '健康': FitnessCenter, '饮食': Restaurant, '心理': Psychology, '默认': Schedule,
};
const getIcon = (title: string) => {
  for (const k of Object.keys(icons)) if (title.includes(k)) return icons[k];
  return icons['默认'];
};

export default function StrategySettings() {
  const [strategies, setStrategies] = useState<Strategy[]>(() => {
    const saved = localStorage.getItem('strategies');
    return saved ? JSON.parse(saved) : [];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });
  // 卡片背景（无整体背景）
  const [cardBg, setCardBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });
  const [tempCardBg, setTempCardBg] = useState({ url: '', scale: 100, posX: 50, posY: 50, opacity: 100 });

  useEffect(() => {
    const savedCard = localStorage.getItem('strategyCardBg');
    if (savedCard) {
      const parsed = JSON.parse(savedCard);
      setCardBg(parsed);
      setTempCardBg(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('strategies', JSON.stringify(strategies));
  }, [strategies]);

  useEffect(() => {
    localStorage.setItem('strategyCardBg', JSON.stringify(cardBg));
  }, [cardBg]);

  const openSettings = () => {
    setTempCardBg({ ...cardBg });
    setSettingsOpen(true);
  };
  const applySettings = () => {
    setCardBg(tempCardBg);
    setSettingsOpen(false);
  };
  const cancelSettings = () => {
    setSettingsOpen(false);
  };
  const updateTempCardBg = (updates: any) => {
    setTempCardBg({ ...tempCardBg, ...updates });
  };

  const openDialog = (s?: Strategy) => {
    if (s) { setEditing(s); setForm({ title: s.title, content: s.content }); }
    else { setEditing(null); setForm({ title: '', content: '' }); }
    setDialogOpen(true);
  };

  useEffect(() => {
    const handler = () => openDialog();
    window.addEventListener('openAddStrategyDialog', handler);
    return () => window.removeEventListener('openAddStrategyDialog', handler);
  }, []);

  const save = () => {
    if (!form.title.trim()) return;
    if (editing) {
      setStrategies(prev => prev.map(s => s.id === editing.id ? { ...s, title: form.title, content: form.content } : s));
    } else {
      setStrategies(prev => [...prev, { id: Date.now().toString(), title: form.title, content: form.content, expanded: false }]);
    }
    setDialogOpen(false);
  };
  const del = (id: string) => setStrategies(prev => prev.filter(s => s.id !== id));
  const toggle = (id: string) => setStrategies(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));

  return (
    <Box sx={{ minHeight: '100%', p: 2, bgcolor: '#FAFAFA' }}>
      <Stack direction="row" justifyContent="flex-end" spacing={1} mb={3}>
        <IconButton size="small" onClick={() => setInfoOpen(true)}><InfoIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={openSettings}><SettingsIcon fontSize="small" /></IconButton>
      </Stack>

      <Stack spacing={2}>
        {strategies.map(s => {
          const Icon = getIcon(s.title);
          return (
            <Card key={s.id} sx={{
              p: 2,
              backgroundImage: cardBg.url ? `url(${cardBg.url})` : 'none',
              backgroundSize: `${cardBg.scale}%`,
              backgroundPosition: `${cardBg.posX}% ${cardBg.posY}%`,
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
            }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Icon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600} flex={1}>{s.title}</Typography>
                  <IconButton size="small" onClick={() => openDialog(s)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => del(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
                {s.content && (
                  <>
                    <Collapse in={s.expanded} collapsedSize={60}>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{s.content}</Typography>
                    </Collapse>
                    {s.content.length > 100 && (
                      <Button size="small" onClick={() => toggle(s.id)} endIcon={s.expanded ? <ExpandLess /> : <ExpandMore />} sx={{ alignSelf: 'flex-start' }}>
                        {s.expanded ? '收起' : '展开'}
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Card>
          );
        })}
        {strategies.length === 0 && (
          <Card sx={{ p: 6, textAlign: 'center', bgcolor: alpha('#6366f1',0.05) }}>
            <Schedule sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography>暂无策略，点击底部加号添加</Typography>
          </Card>
        )}
      </Stack>

      {/* 添加/编辑策略对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editing ? '编辑策略' : '添加策略'}</DialogTitle>
        <DialogContent>
          <TextField label="策略名称" value={form.title} onChange={e => setForm({...form, title: e.target.value})} fullWidth margin="normal" />
          <TextField label="策略内容" multiline rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions><Button onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={save} variant="contained">保存</Button></DialogActions>
      </Dialog>

      {/* 卡片背景设置对话框 */}
      <Dialog open={settingsOpen} onClose={cancelSettings} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={2}>🎨 卡片背景设置</Typography>
          {tempCardBg.url ? (
            <ImageEditor
              imageUrl={tempCardBg.url}
              onUpdate={updateTempCardBg}
              initialScale={tempCardBg.scale}
              initialPosX={tempCardBg.posX}
              initialPosY={tempCardBg.posY}
              initialOpacity={tempCardBg.opacity}
            />
          ) : (
            <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
              上传卡片背景图片
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const url = ev.target?.result as string;
                    updateTempCardBg({ url, scale: 100, posX: 50, posY: 50, opacity: 100 });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </Button>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={cancelSettings} sx={{ flex: 1 }}>取消</Button>
            <Button variant="contained" onClick={applySettings} sx={{ flex: 1 }}>确定</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>📚 策略是什么？</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>记录你想坚持的习惯或方法，例如养肤策略、学习计划等。</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setInfoOpen(false)}>明白啦</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
