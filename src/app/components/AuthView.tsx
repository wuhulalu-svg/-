import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

interface AuthViewProps {
  onLoginSuccess: () => void;
  loginBgImage?: string;
}

// QQ邮箱配置（需要后端服务器使用）
// 授权码: ylnajxmbhfxsdaef
// SMTP服务器: smtp.qq.com
// 端口: 465 (SSL) 或 587 (TLS)

export default function AuthView({ onLoginSuccess, loginBgImage }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 发送验证码（优先使用后端，失败则降级到模拟）
  const sendVerificationCode = async () => {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setError('');
    setSuccess('');

    try {
      // 尝试调用后端API发送真实邮件
      const response = await fetch('http://localhost:3001/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // 检查响应是否为JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('后端未运行');
      }

      const data = await response.json();

      if (data.success) {
        // 后端发送成功
        setCodeSent(true);
        setSuccess(data.message);
        setSentCode(''); // 真实验证码不在前端存储

        // 倒计时60秒
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || '发送失败');
      }
    } catch (error) {
      // 后端连接失败，降级到模拟模式
      console.error('后端连接错误:', error);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);
      setCodeSent(true);
      setSuccess(`⚠️ 后端未连接，使用模拟模式\n验证码：${code}`);

      // 倒计时60秒
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    // 验证必填项
    if (!email || !password || !verifyCode) {
      setError('请填写所有必填项');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    // 验证验证码
    let codeValid = false;

    if (sentCode) {
      // 模拟模式：本地验证
      codeValid = verifyCode === sentCode;
      if (!codeValid) {
        setError('验证码不正确');
        return;
      }
    } else {
      // 真实模式：后端验证
      try {
        const response = await fetch('http://localhost:3001/api/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verifyCode })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('后端未运行');
        }

        const data = await response.json();

        if (!data.success) {
          setError(data.message || '验证码不正确');
          return;
        }

        codeValid = true;
      } catch (error) {
        setError('验证失败，请稍后重试');
        return;
      }
    }

    // 保存用户信息（实际项目应该发送到后端）
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 检查邮箱是否已注册
    if (users.find((u: any) => u.email === email)) {
      setError('该邮箱已被注册');
      return;
    }

    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);

    setSuccess('注册成功！');
    setTimeout(() => {
      onLoginSuccess();
    }, 1000);
  };

  const handleLogin = () => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    // 验证用户（实际项目应该调用后端API）
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      setError('邮箱或密码错误');
      return;
    }

    localStorage.setItem('currentUser', email);
    setSuccess('登录成功！');
    setTimeout(() => {
      onLoginSuccess();
    }, 500);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#FAFAFA',
        backgroundImage: loginBgImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${loginBgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 3,
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          主人你来啦~(≧∀≦)ゞ
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab label="登录" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="注册" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 登录表单 */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{ textTransform: 'none', py: 1.5 }}
            >
              登录
            </Button>
          </Stack>
        )}

        {/* 注册表单 */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="密码至少6个字符"
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                label="验证码"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="请输入邮箱验证码"
              />
              <Button
                variant="outlined"
                onClick={sendVerificationCode}
                disabled={countdown > 0}
                sx={{ minWidth: 120, textTransform: 'none' }}
              >
                {countdown > 0 ? `${countdown}秒` : '发送验证码'}
              </Button>
            </Stack>
            {codeSent && (
              <Typography variant="caption" color="text.secondary">
                💡 开发模式：验证码已在上方提示中显示
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={handleRegister}
              sx={{ textTransform: 'none', py: 1.5 }}
            >
              注册
            </Button>
          </Stack>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          提示：当前为演示模式，数据仅保存在本地
        </Typography>
      </Card>
    </Box>
  );
}
