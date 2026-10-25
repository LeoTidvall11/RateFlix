import ScreenBackground from 'components/ScreenBackground';
import { useState } from 'react';
import { useAuth } from 'context/authContext';
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

export default function ProfilePage() {
  const { user, login, register, logout } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      setPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ScreenBackground>
      <View className="px-6 pt-8">
        {user ? (
          <View className="items-center rounded-2xl border-glass-border bg-glass p-6">
            <Text className="mb-2 text-2xl font-bold text-text-primary">{user.name}</Text>
            <Text className="mb-6 text-sm text-text-secondary">{user.email}</Text>

            <Pressable
              onPress={logout}
              className="w-full items-center rounded-2xl bg-blood-600 py-3 active:opacity-80">
              <Text className="fontBold text-base text-text-primary">Logga ut!</Text>
            </Pressable>
          </View>
        ) : (
          <View className="rounded-2xl border border-glass-border bg-glass p-6">
            <Text className="mb-2 text-center text-2xl font-bold text-text-primary">
              {isRegistering ? 'Skapa konto' : 'Välkommen Tillbaka!'}
            </Text>
            <Text className="mb-6 text-center text-sm text-text-secondary">
              {isRegistering
                ? 'Registrera för att för att spara favoriter och möjligheten att recensera filmer'
                : 'Logga in för att få tillgång till din profil'}
            </Text>
            {isRegistering && (
              <View className="mb-4">
                <Text className="mb-1 text-xs font-semibold uppercase text-text-secondary">
                  Namn
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ditt namn"
                  placeholderTextColor="#7E7371"
                  className="rounded-xl border border-glass-border bg-black/30 px-4 py-3 text-text-primary"
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="mb-1 text-xs font-semibold uppercase text-text-secondary">
                E-post
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="namn@exempel.se"
                placeholderTextColor="#7E7371"
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-xl border border-glass-border bg-black/30 px-4 py-3 text-text-primary"
              />
            </View>

            <View className="mb-6">
              <Text className="mb-1 text-xs font-semibold uppercase text-text-secondary">
                Lösenord
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#7E7371"
                secureTextEntry
                className="rounded-xl border border-glass-border bg-black/30 px-4 py-3 text-text-primary"
              />
            </View>

            {error ? (
              <Text className="mb-4 text-center text-sm text-blood-300">{error}</Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className="mb-4 w-full items-center rounded-2xl bg-blood-600 py-3.5 active:opacity-80">
              {submitting ? (
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
                setError(null);
              }}
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
