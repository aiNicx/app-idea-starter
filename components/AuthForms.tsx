import React, { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Language, translations } from '../lib/translations';

interface AuthFormsProps {
  language: Language;
  onAuthSuccess: (user: any) => void;
  onLogin?: (email: string, password: string) => Promise<boolean>;
  onRegister?: (email: string, password: string, name?: string) => Promise<boolean>;
}

export const LoginForm: React.FC<AuthFormsProps> = ({ language, onAuthSuccess, onLogin }) => {
  const t = translations[language];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (onLogin) {
        const success = await onLogin(email, password);
        if (success) {
          onAuthSuccess({ email, name: '', language: language });
        }
      } else {
        // Fallback se onLogin non è fornito
        const signInAction = useAction(api.auth.signIn);
        const result = await signInAction({ email, password });
        if (result.success) {
          onAuthSuccess(result.user);
        }
      }
    } catch (err: any) {
      setError(err.message || t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-secondary rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-light mb-6 text-center">{t.loginTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.emailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.passwordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-primary font-bold py-2 rounded-lg hover:bg-sky-400 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t.signingIn : t.signIn}
        </button>
      </form>
    </div>
  );
};

export const RegisterForm: React.FC<AuthFormsProps> = ({ language, onAuthSuccess, onRegister }) => {
  const t = translations[language];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setIsLoading(true);

    try {
      if (onRegister) {
        const success = await onRegister(email, password, name || undefined);
        if (success) {
          onAuthSuccess({ email, name, language });
        }
      } else {
        // Fallback se onRegister non è fornito
        const signUpAction = useAction(api.auth.signUp);
        const result = await signUpAction({
          email,
          password,
          name: name || undefined,
          language: language,
        });
        
        if (result.success) {
          onAuthSuccess({ id: result.userId, email, name, language });
        }
      }
    } catch (err: any) {
      setError(err.message || t.registerError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-secondary rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-light mb-6 text-center">{t.registerTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.emailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.nameLabel} ({t.optional})
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.passwordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.confirmPasswordLabel}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-primary font-bold py-2 rounded-lg hover:bg-sky-400 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t.registering : t.registerTitle}
        </button>
      </form>
    </div>
  );
};

export const UserProfile: React.FC<{ 
  user: any; 
  language: Language; 
  onLogout: () => void;
  onUpdateUser: (user: any) => void;
}> = ({ user, language, onLogout, onUpdateUser }) => {
  const t = translations[language];
  const updateProfileMutation = useMutation(api.auth.updateProfile);
  const changePasswordMutation = useMutation(api.auth.changePassword);
  
  const [name, setName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      await updateProfileMutation({
        userId: user.id,
        name,
        language: language,
      });
      onUpdateUser({ ...user, name });
      setMessage(t.profileUpdated);
    } catch (err: any) {
      setMessage(err.message || t.updateError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmNewPassword) {
      setMessage(t.passwordMismatch);
      return;
    }

    if (newPassword.length < 6) {
      setMessage(t.passwordTooShort);
      return;
    }

    setIsLoading(true);

    try {
      await changePasswordMutation({
        userId: user.id,
        currentPassword,
        newPassword,
      });
      setMessage(t.passwordChanged);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setMessage(err.message || t.passwordChangeError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-secondary rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-light mb-6 text-center">{t.profileTitle}</h2>
      
      <div className="mb-6">
        <p className="text-dark-text text-sm">{t.loggedInAs}: {user.email}</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-light">{t.updateProfile}</h3>
        
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-primary font-bold py-2 rounded-lg hover:bg-sky-400 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t.updating : t.updateProfile}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-lg font-semibold text-light">{t.changePassword}</h3>
        
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.currentPasswordLabel}
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.newPasswordLabel}
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            {t.confirmNewPasswordLabel}
          </label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full px-3 py-2 bg-primary text-light rounded-md border border-primary focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-primary font-bold py-2 rounded-lg hover:bg-sky-400 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t.changing : t.changePassword}
        </button>
      </form>

      {message && (
        <div className="text-center text-sm mt-4 p-2 bg-primary rounded text-accent">
          {message}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-primary">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
};
