import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Stack,
  Collapse,
  Button,
  Chip,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

interface SubTask {
  id: string;
  content: string;
  startTime: string;
  endTime: string;
}

interface Task {
  id: string;
  content: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  subTasks: SubTask[];
  expanded: boolean;
}

export default function SchedulePlanner() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('scheduleTasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('scheduleTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      content: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      subTasks: [],
      expanded: false,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, field: keyof Task, value: any) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskExpanded = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, expanded: !task.expanded } : task
    ));
  };

  const addSubTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubTask: SubTask = {
          id: Date.now().toString(),
          content: '',
          startTime: task.startTime,
          endTime: task.endTime,
        };
        return {
          ...task,
          subTasks: [...task.subTasks, newSubTask],
          expanded: true,
        };
      }
      return task;
    }));
  };

  const updateSubTask = (taskId: string, subTaskId: string, field: keyof SubTask, value: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subTasks: task.subTasks.map(subTask =>
            subTask.id === subTaskId ? { ...subTask, [field]: value } : subTask
          ),
        };
      }
      return task;
    }));
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subTasks: task.subTasks.filter(subTask => subTask.id !== subTaskId),
        };
      }
      return task;
    }));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            日程规划
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理您的任务和时间安排
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={addTask}
          sx={{
            py: 1.2,
            px: 3,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          添加任务
        </Button>
      </Stack>

      <Stack spacing={3}>
        {tasks.map(task => (
          <Paper
            key={task.id}
            elevation={2}
            sx={{
              p: 3,
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: 4,
                borderColor: 'primary.main',
              },
            }}
          >
            <Stack spacing={3}>
              {/* Time Area */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <CalendarIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    时间区域
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <TextField
                    type="date"
                    label="开始日期"
                    value={task.startDate}
                    onChange={(e) => updateTask(task.id, 'startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ minWidth: 180 }}
                  />
                  <TextField
                    type="time"
                    label="开始时间"
                    value={task.startTime}
                    onChange={(e) => updateTask(task.id, 'startTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    type="date"
                    label="结束日期"
                    value={task.endDate}
                    onChange={(e) => updateTask(task.id, 'endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ minWidth: 180 }}
                  />
                  <TextField
                    type="time"
                    label="结束时间"
                    value={task.endTime}
                    onChange={(e) => updateTask(task.id, 'endTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} mt={1.5}>
                  <Chip
                    icon={<TimeIcon />}
                    label={`${task.startDate} ${task.startTime} - ${task.endDate} ${task.endTime}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                  />
                </Stack>
              </Box>

              {/* Content Area */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    内容区域
                  </Typography>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="输入任务内容..."
                  value={task.content}
                  onChange={(e) => updateTask(task.id, 'content', e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha('#6366f1', 0.02),
                    },
                  }}
                />
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => addSubTask(task.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    添加子任务
                  </Button>
                  {task.subTasks.length > 0 && (
                    <>
                      <Chip
                        label={`${task.subTasks.length} 个子任务`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        onClick={() => toggleTaskExpanded(task.id)}
                        sx={{
                          bgcolor: task.expanded ? 'primary.main' : 'transparent',
                          color: task.expanded ? 'white' : 'text.secondary',
                          '&:hover': {
                            bgcolor: task.expanded ? 'primary.dark' : alpha('#000', 0.05),
                          },
                        }}
                      >
                        {task.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </>
                  )}
                </Stack>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteTask(task.id)}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha('#f44336', 0.1),
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>

              {/* Sub Tasks */}
              <Collapse in={task.expanded}>
                <Stack spacing={2} sx={{ pl: 2, mt: 1 }}>
                  {task.subTasks.map(subTask => (
                    <Paper
                      key={subTask.id}
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        bgcolor: alpha('#6366f1', 0.02),
                        borderLeft: '3px solid',
                        borderLeftColor: 'primary.main',
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <TextField
                            type="time"
                            label="子任务开始时间"
                            value={subTask.startTime}
                            onChange={(e) => updateSubTask(task.id, subTask.id, 'startTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ minWidth: 150 }}
                          />
                          <TextField
                            type="time"
                            label="子任务结束时间"
                            value={subTask.endTime}
                            onChange={(e) => updateSubTask(task.id, subTask.id, 'endTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ minWidth: 150 }}
                          />
                          <Chip
                            icon={<TimeIcon />}
                            label={`${subTask.startTime} - ${subTask.endTime}`}
                            size="small"
                            variant="filled"
                            color="primary"
                            sx={{ fontFamily: 'monospace' }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="输入子任务内容..."
                            value={subTask.content}
                            onChange={(e) => updateSubTask(task.id, subTask.id, 'content', e.target.value)}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                              },
                            }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteSubTask(task.id, subTask.id)}
                            sx={{
                              mt: 0.5,
                              '&:hover': {
                                bgcolor: alpha('#f44336', 0.1),
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Collapse>
            </Stack>
          </Paper>
        ))}

        {tasks.length === 0 && (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              bgcolor: alpha('#6366f1', 0.02),
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              暂无任务
            </Typography>
            <Typography variant="body2" color="text.disabled">
              点击上方按钮添加新任务
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
