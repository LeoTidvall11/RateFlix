import ScreenBackground from 'components/ScreenBackground';
import ProfileComments from 'components/comments/ProfileComments';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from 'context/authContext';
import { useToast } from 'context/ToastContext';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';

function getErrorMessage(error) {
  switch (error.status) {
    case 400:
      return error.errors?.password
        ? 'Lösenordet måste vara minst 8 tecken'
        : 'Kontrollera att alla fält är rätt ifyllda';
    case 401:
      return 'Fel e-post eller lösenord';
    case 409:
      return 'Det finns redan ett konto med den e-postadressen';
    default:
      return 'Kunde inte nå servern, försök igen';
  }
}

function FormField({ control, name, label, rules, className = 'mb-4', ...inputProps }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className={className}>
          <Text className="mb-1 text-xs font-semibold uppercase text-text-secondary">{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor="#7E7371"
            className="rounded-xl border border-glass-border bg-black/30 px-4 py-3 text-text-primary"
            {...inputProps}
          />
          {error ? <Text className="mt-1 text-xs text-blood-300">{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

export default function ProfilePage({ route, navigation }) {
  const { user, login, register, logout } = useAuth();
  const { showToast } = useToast();

  const redirectTo = route.params?.redirectTo;

  useEffect(
    () => navigation.addListener('blur', () => navigation.setParams({ redirectTo: undefined })),
    [navigation]
  );

  const [isRegistering, setIsRegistering] = useState(false);
  const {
    control,
    handleSubmit,
    resetField,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
    shouldUnregister: true,
  });

  const onSubmit = async ({ name, email, password }) => {
    try {
      if (isRegistering) {
        await register(name.trim(), email.trim(), password);
        showToast('Kontot skapades, du är nu inloggad');
      } else {
        await login(email.trim(), password);
        showToast('Du är inloggad');
      }
      resetField('password');

      if (redirectTo) {
        navigation.setParams({ redirectTo: undefined });
        navigation.navigate(redirectTo.name, redirectTo.params);
      }
    } catch (err) {
      if (err.status === 400 && err.errors?.password) {
        setError('password', { message: getErrorMessage(err) });
      } else {
        setError('root.server', { message: getErrorMessage(err) });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Du är utloggad');
  };

  return (
    <ScreenBackground>
      <View className="px-6 pt-8">
        {user ? (
          <>
            <View className="items-center rounded-2xl border-glass-border bg-glass p-6">
              <Text className="mb-2 text-2xl font-bold text-text-primary">{user.name}</Text>
              <Text className="mb-6 text-sm text-text-secondary">{user.email}</Text>

              <Pressable
                onPress={handleLogout}
                accessibilityRole="button"
                className="w-full items-center rounded-2xl bg-blood-600 py-3 active:opacity-80">
                <Text className="text-base font-bold text-text-primary">Logga ut!</Text>
              </Pressable>
            </View>

            <ProfileComments />
          </>
        ) : (
          <View className="rounded-2xl border border-glass-border bg-glass p-6">
            <Text className="mb-2 text-center text-2xl font-bold text-text-primary">
              {isRegistering ? 'Skapa konto' : 'Välkommen Tillbaka!'}
            </Text>
            <Text className="mb-6 text-center text-sm text-text-secondary">
              {redirectTo
                ? 'Du behöver vara inloggad för att göra det. Du skickas tillbaka efteråt.'
                : isRegistering
                  ? 'Registrera för att för att spara favoriter och möjligheten att recensera filmer'
                  : 'Logga in för att få tillgång till din profil'}
            </Text>
            {isRegistering && (
              <FormField
                control={control}
                name="name"
                label="Namn"
                placeholder="Ditt namn"
                rules={{ validate: (value) => value.trim() !== '' || 'Ange ditt namn' }}
              />
            )}

            <FormField
              control={control}
              name="email"
              label="E-post"
              placeholder="namn@exempel.se"
              keyboardType="email-address"
              autoCapitalize="none"
              rules={{
                required: 'Ange din e-post',
                pattern: { value: /^\s*\S+@\S+\.\S+\s*$/, message: 'Ogiltig e-postadress' },
              }}
            />

            <FormField
              control={control}
              name="password"
              label="Lösenord"
              className="mb-6"
              placeholder="••••••••"
              secureTextEntry
              rules={{
                required: 'Ange ditt lösenord',
                ...(isRegistering && {
                  minLength: { value: 8, message: 'Lösenordet måste vara minst 8 tecken' },
                }),
              }}
            />

            {errors.root?.server ? (
              <Text className="mb-4 text-center text-sm text-blood-300">
                {errors.root.server.message}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={isRegistering ? 'Skapa konto' : 'Logga in'}
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
              className="mb-4 w-full items-center rounded-2xl bg-blood-600 py-3.5 active:opacity-80">
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {isRegistering ? 'Skapa konto' : 'Logga in'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setIsRegistering(!isRegistering);
                clearErrors();
              }}
              accessibilityRole="button"
              className="items-center py-2">
              <Text className="text-sm text-text-secondary">
                {isRegistering ? 'Har du redan ett konto? ' : 'Har du inget konto? '}
                <Text className="font-bold text-blood-600">
                  {isRegistering ? 'Logga in' : 'Skapa ett'}
                </Text>
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenBackground>
  );
}
