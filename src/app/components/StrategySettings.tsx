import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, IconButton, Card, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Collapse, alpha, Slider,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandMore, ExpandLess, Settings as SettingsIcon, Info as InfoIcon,
  FitnessCenter, Restaurant, Psychology, Schedule,
} from '@mui/icons-material';

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
  const [bgSettings, setBgSettings] = useState({ url: '', scale: 100, posX: 50, posY: 50 });

  useEffect(() => {
    const savedBg = localStorage.getItem('strategyBgSettings');
    if (savedBg) setBgSettings(JSON.parse(savedBg));
  }, []);

  useEffect(() => {
    localStorage.setItem('strategies', JSON.stringify(strategies));
  }, [strategies]);

  const openDialog = useCallback((s?: Strategy) => {
    if (s) { setEditing(s); setForm({ title: s.title, content: s.content }); }
    else { setEditing(null); setForm({ title: '', content: '' }); }
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => openDialog();
    window.addEventListener('openAddStrategyDialog', handler);
    return () => window.removeEventListener('openAddStrategyDialog', handler);
  }, [openDialog]);

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

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const newSettings = { url, scale: 100, posX: 50, posY: 50 };
      setBgSettings(newSettings);
      localStorage.setItem('strategyBgSettings', JSON.stringify(newSettings));
    };
    reader.readAsDataURL(file);
  };
  const updateBg = (key: string, val: number) => {
    const newSettings = { ...bgSettings, [key]: val };
    setBgSettings(newSettings);
    localStorage.setItem('strategyBgSettings', JSON.stringify(newSettings));
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      {/* 背景层 */}
      {bgSettings.url && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgSettings.url})`, backgroundSize: `${bgSettings.scale}%`, backgroundPosition: `${bgSettings.posX}% ${bgSettings.posY}%`, opacity: 0.6 }} />
      )}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1} mb={3}>
          <IconButton size="small" onClick={() => setInfoOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', boxShadow: 1 }}><InfoIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.8)', boxShadow: 1 }}><SettingsIcon fontSize="small" /></IconButton>
        </Stack>

        <Stack spacing={2}>
          {strategies.map(s => {
            const Icon = getIcon(s.title);
            return (
              <Card key={s.id} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
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
      </Box>

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editing ? '编辑策略' : '添加策略'}</DialogTitle>
        <DialogContent>
          <TextField label="策略名称" value={form.title} onChange={e => setForm({...form, title: e.target.value})} fullWidth margin="normal" />
          <TextField label="策略内容" multiline rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions><Button onClick={() => setDialogOpen(false)}>取消</Button><Button onClick={save} variant="contained">保存</Button></DialogActions>
      </Dialog>

      {/* 背景设置 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" fontWeight={700} mb={2}>🎨 背景设置</Typography>
          <Button variant="outlined" component="label" fullWidth>{bgSettings.url ? '更换图片' : '上传图片'}<input type="file" hidden accept="image/*" onChange={handleBgUpload} /></Button>
          {bgSettings.url && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption">缩放 {bgSettings.scale}%</Typography><Slider value={bgSettings.scale} onChange={(_, v) => updateBg('scale', v as number)} min={50} max={200} />
              <Typography variant="caption">水平位置</Typography><Slider value={bgSettings.posX} onChange={(_, v) => updateBg('posX', v as number)} min={0} max={100} />
              <Typography variant="caption">垂直位置</Typography><Slider value={bgSettings.posY} onChange={(_, v) => updateBg('posY', v as number)} min={0} max={100} />
              <Box sx={{ height: 100, borderRadius: 2, backgroundImage: `url(${bgSettings.url})`, backgroundSize: `${bgSettings.scale}%`, backgroundPosition: `${bgSettings.posX}% ${bgSettings.posY}%`, border: '1px solid #ddd', mt: 1 }} />
            </Box>
          )}
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setSettingsOpen(false)}>完成</Button>
        </DialogContent>
      </Dialog>

      {/* 功能介绍 */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogContent>
          <Typography variant="h6" fontWeight={700}>📚 策略是什么？</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>记录你想坚持的习惯或方法，比如养肤策略、学习计划等，时刻提醒自己。</Typography>
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setInfoOpen(false)}>明白啦</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
