import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Ticket,
  Tag,
  Bell,
  BellRing,
  HelpCircle,
  LogOut,
  LogIn,
  ChevronRight,
  Moon,
  Pencil,
  Check,
  KeyRound,
} from 'lucide-react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@ctypes/navigation';
import { ColorTokens, FontFamily, FontSize, FontWeight, Radius, Spacing, makeNeonShadow } from '@constants/theme';
import { useTheme } from '@hooks/useTheme';
import { Button, Card, Input } from '@shared/ui';
import { Heading2, Heading3, Body, BodySmall, Caption } from '@shared/ui';
import { useBookingStore } from '@store/bookingStore';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
import { authService } from '@services/authService';
import { errorMessage } from '@services/httpClient';
import { enablePush, disablePush } from '@services/pushService';
import { signInWithGoogle } from '@features/auth/utils/googleAuth';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ProfileTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface ProfileMenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

export function ProfileScreen({ navigation }: Props) {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const resetBookingFlow = useBookingStore(s => s.resetBookingFlow);
  const status = useAuthStore(s => s.status);
  const customer = useAuthStore(s => s.customer);
  const logout = useAuthStore(s => s.logout);
  const updateCustomer = useAuthStore(s => s.updateCustomer);
  const refreshCustomer = useAuthStore(s => s.refreshCustomer);
  const pushEnabled = useNotificationStore(s => s.pushEnabled);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  async function handleTogglePush() {
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await disablePush();
      } else {
        const granted = await enablePush();
        if (!granted) {
          Alert.alert(
            'Notifications blocked',
            'Enable notifications for CineHall in your phone Settings to receive push alerts.',
          );
        }
      }
    } finally {
      setPushBusy(false);
    }
  }

  useEffect(() => {
    setName(customer?.name ?? '');
    setPhone(customer?.phone ?? '');
  }, [customer]);

  function handleLogout() {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          resetBookingFlow();
          await logout();
          navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('MainTabs');
        },
      },
    ]);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await authService.update({ name: name.trim(), phone: phone.trim() || undefined });
      updateCustomer({ name: name.trim(), phone: phone.trim() });
      setEditing(false);
    } catch (err) {
      Alert.alert('Could not save', errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const isGoogleLinked = customer?.authProviders?.includes('google') ?? false;

  async function connectGoogle() {
    setGoogleBusy(true);
    const result = await signInWithGoogle();
    if (result.idToken) {
      try {
        await authService.linkProvider('google', result.idToken);
        await refreshCustomer();
      } catch (err) {
        Alert.alert('Could not link Google', errorMessage(err));
      }
    } else if (result.error) {
      Alert.alert('Google sign-in failed', result.error);
    }
    setGoogleBusy(false);
  }

  function disconnectGoogle() {
    Alert.alert('Disconnect Google?', 'You will only be able to sign in with your email and password.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.unlinkProvider('google');
            await refreshCustomer();
          } catch (err) {
            Alert.alert('Could not disconnect', errorMessage(err));
          }
        },
      },
    ]);
  }

  if (status !== 'authed') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.signedOutBody}>
          <View style={styles.guestAvatar}>
            <Text style={styles.guestAvatarText}>?</Text>
          </View>
          <Heading2 style={styles.userName}>Welcome to CineHall</Heading2>
          <Body style={styles.userEmail}>Sign in to manage bookings and your profile.</Body>
          <Button
            label="Sign In"
            onPress={() => navigation.navigate('Login', {})}
            leftIcon={<LogIn size={18} color={colors.textInverse} />}
            style={styles.signInBtn}
          />

          <Pressable style={[styles.themeRow, styles.themeRowGuest]} onPress={toggleTheme}>
            <View style={styles.themeRowLeft}>
              <View style={styles.menuIconWrapper}>
                <Moon size={18} color={colors.textPrimary} />
              </View>
              <BodySmall style={styles.themeLabel}>Dark Mode</BodySmall>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.secondary, true: colors.accent }}
              thumbColor={colors.textOnMedia}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems: ProfileMenuItem[] = [
    {
      icon: <Ticket size={18} color={colors.textPrimary} />,
      label: 'My Bookings',
      description: 'View your booking history',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      icon: <Tag size={18} color={colors.textPrimary} />,
      label: 'Offers & Coupons',
      description: 'Discounts available on your account',
      onPress: () => navigation.navigate('Offers'),
    },
    {
      icon: <KeyRound size={18} color={colors.textPrimary} />,
      label: customer?.hasPassword ? 'Change Password' : 'Set Password',
      description: customer?.hasPassword ? 'Update your account password' : 'Add a password to sign in without Google',
      onPress: () => navigation.navigate(customer?.hasPassword ? 'ChangePassword' : 'SetPassword'),
    },
    { icon: <Bell size={18} color={colors.textPrimary} />, label: 'Notifications', description: 'Manage alerts', onPress: () => navigation.navigate('Notifications') },
    { icon: <HelpCircle size={18} color={colors.textPrimary} />, label: 'Help & Support', description: 'FAQs and contact us', onPress: () => Alert.alert('Help & Support', 'Email support@cinehall.app for assistance.') },
    { icon: <LogOut size={18} color={colors.error} />, label: 'Logout', description: 'Sign out of your account', onPress: handleLogout, isDestructive: true },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          {customer?.avatarUrl ? (
            <Image source={{ uri: customer.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <LinearGradient
              colors={[colors.accent, colors.accentDim]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarInitials}>{initialsFor(customer?.name ?? '?')}</Text>
            </LinearGradient>
          )}

          {editing ? (
            <View style={styles.editForm}>
              <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
              <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
              <View style={styles.editActions}>
                <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} style={styles.editActionBtn} />
                <Button
                  label={saving ? 'Saving…' : 'Save'}
                  onPress={saveProfile}
                  disabled={saving}
                  loading={saving}
                  leftIcon={<Check size={16} color={colors.textInverse} />}
                  style={styles.editActionBtn}
                />
              </View>
            </View>
          ) : (
            <>
              <Heading2 style={styles.userName}>{customer?.name}</Heading2>
              <Body style={styles.userEmail}>{customer?.email}</Body>
              {customer?.phone ? <Body style={styles.userEmail}>{customer.phone}</Body> : null}
              <Pressable style={styles.editLink} onPress={() => setEditing(true)}>
                <Pencil size={12} color={colors.accent} />
                <Caption style={styles.editLinkText}>Edit Profile</Caption>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Caption style={styles.cardLabel}>CONNECTED LOGIN METHODS</Caption>
          <View style={styles.providerRow}>
            <Body style={styles.providerLabel}>Email &amp; Password</Body>
            <Badge active label={customer?.hasPassword ? 'Active' : 'Not set'} colors={colors} />
          </View>
          <View style={styles.providerRow}>
            <Body style={styles.providerLabel}>Google</Body>
            {isGoogleLinked ? (
              <Pressable onPress={disconnectGoogle}>
                <Caption style={styles.disconnectText}>Disconnect</Caption>
              </Pressable>
            ) : googleBusy ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Pressable onPress={connectGoogle}>
                <Caption style={styles.connectText}>Connect</Caption>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.themeRow} onPress={toggleTheme}>
          <View style={styles.themeRowLeft}>
            <View style={styles.menuIconWrapper}>
              <Moon size={18} color={colors.textPrimary} />
            </View>
            <BodySmall style={styles.themeLabel}>Dark Mode</BodySmall>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.secondary, true: colors.accent }}
            thumbColor={colors.textOnMedia}
          />
        </Pressable>

        <Pressable style={styles.themeRow} onPress={handleTogglePush} disabled={pushBusy}>
          <View style={styles.themeRowLeft}>
            <View style={styles.menuIconWrapper}>
              <BellRing size={18} color={colors.textPrimary} />
            </View>
            <BodySmall style={styles.themeLabel}>Push Notifications</BodySmall>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={handleTogglePush}
            disabled={pushBusy}
            trackColor={{ false: colors.secondary, true: colors.accent }}
            thumbColor={colors.textOnMedia}
          />
        </Pressable>

        <View style={styles.menu}>
          {menuItems.map(item => (
            <Card key={item.label} onPress={item.onPress} padding="md">
              <View style={styles.menuRow}>
                <View style={[styles.menuIconWrapper, item.isDestructive && styles.menuIconWrapperDanger]}>
                  {item.icon}
                </View>
                <View style={styles.menuText}>
                  <Heading3 style={[styles.menuLabel, item.isDestructive && styles.menuLabelDanger]}>{item.label}</Heading3>
                  <BodySmall>{item.description}</BodySmall>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ label, active, colors }: { label: string; active?: boolean; colors: ColorTokens }) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.smallBadge, active && { backgroundColor: colors.successDim }]}>
      <Caption style={[styles.smallBadgeText, active && { color: colors.success }]}>{label}</Caption>
    </View>
  );
}

const makeStyles = (Colors: ColorTokens) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xxl },
    signedOutBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
    guestAvatar: {
      width: 72,
      height: 72,
      borderRadius: Radius.full,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestAvatarText: { fontSize: FontSize.xl, color: Colors.textMuted, fontWeight: FontWeight.bold },
    signInBtn: { marginTop: Spacing.sm, minWidth: 160 },
    avatarSection: {
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      ...makeNeonShadow(Colors),
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: Radius.full,
      ...makeNeonShadow(Colors),
    },
    avatarInitials: {
      color: Colors.textPrimary,
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      fontWeight: FontWeight.bold,
    },
    userName: {
      color: Colors.textPrimary,
    },
    userEmail: {
      color: Colors.textSecondary,
    },
    editLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
    editLinkText: { color: Colors.accent, fontWeight: FontWeight.semibold },
    editForm: { width: '100%', gap: Spacing.sm, marginTop: Spacing.sm },
    editActions: { flexDirection: 'row', gap: Spacing.sm },
    editActionBtn: { flex: 1 },
    card: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    cardLabel: { fontWeight: FontWeight.semibold, marginBottom: Spacing.xs },
    providerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    providerLabel: { color: Colors.textPrimary },
    connectText: { color: Colors.accent, fontWeight: FontWeight.semibold },
    disconnectText: { color: Colors.error, fontWeight: FontWeight.semibold },
    smallBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      borderRadius: Radius.full,
      backgroundColor: Colors.surfaceElevated,
    },
    smallBadgeText: { fontSize: FontSize.xs - 1, color: Colors.textMuted, fontWeight: FontWeight.semibold },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: Radius.lg,
      padding: Spacing.md,
    },
    themeRowGuest: { width: '100%', marginTop: Spacing.xl },
    themeRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    themeLabel: { color: Colors.textPrimary, fontWeight: FontWeight.medium },
    menu: { gap: Spacing.sm },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    menuIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: Radius.sm,
      backgroundColor: Colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuIconWrapperDanger: { backgroundColor: Colors.errorDim },
    menuText: { flex: 1, gap: 2 },
    menuLabel: { color: Colors.textPrimary },
    menuLabelDanger: { color: Colors.error },
  });
