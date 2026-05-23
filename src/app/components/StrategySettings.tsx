import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Collapse,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FitnessCenter as FitnessIcon,
  Restaurant as RestaurantIcon,
  Psychology as PsychologyIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Strategy {
  id: string;
  title: string;
  content: string;
}

const strategyIcons: { [key: string]: any } = {
  '健康': FitnessIcon,
  '饮食': RestaurantIcon,
  '心理': PsychologyIcon,
  '默认': ScheduleIcon,
};

const getStrategyIcon = (title: string) => {
  for (const [key, Icon] of Object.entries(strategyIcons)) {
    if (title.includes(key)) return Icon;
  }
  return strategyIcons['默认'];
};

interface StrategyWithExpanded extends Strategy {
  expanded: boolean;
}

export default function StrategySettings() {
  const [strategies, setStrategies] = useState<StrategyWithExpanded[]>(() => {
    const saved = localStorage.getItem('strategies');
    return saved ? JSON.parse(saved) : [];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyWithExpanded | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [strategyBgImage, setStrategyBgImage] = useState('');

  const openDialog = useCallback((strategy?: StrategyWithExpanded) => {
    if (strategy) {
      setEditingStrategy(strategy);
      setFormData({ title: strategy.title, content: strategy.content });
    } else {
      setEditingStrategy(null);
      setFormData({ title: '', content: '' });
    }
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    const handleOpenAddStrategy = () => openDialog();
    window.addEventListener('openAddStrategyDialog', handleOpenAddStrategy);
    return () => window.removeEventListener('openAddStrategyDialog', handleOpenAddStrategy);
  }, [openDialog]);

  useEffect(() => {
    localStorage.setItem('strategies', JSON.stringify(strategies));
  }, [strategies]);

  useEffect(() => {
    const saved = localStorage.getItem('strategyBgImage');
    if (saved) setStrategyBgImage(saved);
  }, []);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setStrategyBgImage(result);
        localStorage.setItem('strategyBgImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingStrategy(null);
    setFormData({ title: '', content: '' });
  };

  const saveStrategy = () => {
    if (!formData.title.trim()) return;
    if (editingStrategy) {
      setStrategies((prev) =>
        prev.map((s) => (s.id === editingStrategy.id ? { ...s, title: formData.title, content: formData.content } : s))
      );
    } else {
      const newStrategy: StrategyWithExpanded = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        expanded: false,
      };
      setStrategies((prev) => [...prev, newStrategy]);
    }
    closeDialog();
  };

  const deleteStrategy = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleExpanded = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1} mb={3}>
        <IconButton
          size="small"
          onClick={() => setInfoDialogOpen(true)}
          sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: 1, '&:hover': { bgcolor: 'white' } }}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => setSettingsOpen(true)}
          sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: 1, '&:hover': { bgcolor: 'white' } }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack spacing={2}>
        {strategies.map((strategy) => {
          const Icon = getStrategyIcon(strategy.title);
          return (
            <Card
              key={strategy.id}
              elevation={2}
              sx={{
                p: 3,
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backgroundImage: strategyBgImage ? `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${strategyBgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backdropFilter: 'blur(10px)',
                '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ fontSize: 24, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {strategy.title}
                  </Typography>
                </Stack>

                {strategy.content && (
                  <>
                    <Collapse in={strategy.expanded} collapsedSize={60}>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {strategy.content}
                      </Typography>
                    </Collapse>
                    {strategy.content.length > 100 && (
                      <Button
                        size="small"
                        onClick={() => toggleExpanded(strategy.id)}
                        endIcon={strategy.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                      >
                        {strategy.expanded ? '收起' : '展开'}
                      </Button>
                    )}
                  </>
                )}

                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openDialog(strategy)} sx={{ flex: 1, textTransform: 'none' }}>
                    编辑
                  </Button>
                  <IconButton size="small" color="error" onClick={() => deleteStrategy(strategy.id)} sx={{ '&:hover': { bgcolor: alpha('#f44336', 0.1) } }}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Card>
          );
        })}

        {strategies.length === 0 && (
          <Card sx={{ p: 8, textAlign: 'center', bgcolor: alpha('#6366f1', 0.02), border: '2px dashed', borderColor: 'divider' }}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>暂无策略</Typography>
            <Typography variant="body2" color="text.disabled">点击底部加号添加新策略</Typography>
          </Card>
        )}
      </Stack>

      {/* 添加/编辑策略对话框 */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStrategy ? '编辑策略' : '添加策略'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="策略名称"
              placeholder="例如：养肤策略、健身计划"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="策略内容"
              placeholder="记录具体的方法、步骤或提醒..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              fullWidth
              multiline
              rows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>取消</Button>
          <Button onClick={saveStrategy} variant="contained" disabled={!formData.title.trim()}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* 功能介绍弹窗 */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📚 策略是什么？</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            策略是用来记录你想坚持的习惯、方法或行动计划，帮助你更好地管理自己。
            <br /><br />
            例如：
            <br />
            • 养肤策略：记录每天的护肤步骤、产品推荐
            <br />
            • 学习策略：制定复习计划、时间管理技巧
            <br />
            • 健康策略：运动计划、饮食搭配
            <br /><br />
            把策略记在这里，时刻提醒自己不要忘记，慢慢养成好习惯。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setInfoDialogOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>明白啦</Button>
        </DialogActions>
      </Dialog>

      {/* 背景设置弹窗 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm">
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>⚙️ 背景设置</Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>策略卡片背景</Typography>
              <Button variant="outlined" component="label" fullWidth>
                {strategyBgImage ? '更换背景图片' : '上传背景图片'}
                <input type="file" hidden accept="image/*" onChange={handleBgUpload} />
              </Button>
              {strategyBgImage && (
                <Box sx={{ mt: 2, height: 100, borderRadius: 2, backgroundImage: `url(${strategyBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #E0E0E0' }} />
              )}
            </Box>
            <Button variant="contained" onClick={() => setSettingsOpen(false)} sx={{ textTransform: 'none' }}>完成</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
