import React, { ReactNode, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from './BottomNavigation';
import DrawerMenu from './DrawerMenu';
import { usePathname } from 'expo-router';

interface PageLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

/**
 * Page Layout Component
 * Provides consistent layout with BottomNavigation and DrawerMenu
 * Use this to wrap your page content
 */
export default function PageLayout({
  children,
  showBottomNav = true,
}: PageLayoutProps) {
  const pathname = usePathname();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Routes where we should hide navigation
  const hideNavRoutes = [
    '/camera-capture',
    '/catch-form',
    '/add-catch',
    '/edit-catch',
    '/login',
    '/signup',
    '/index',
    '/auth/callback',
    '/active-session',
  ];

  const shouldHideNav = hideNavRoutes.some(route => pathname?.startsWith(route));
  const showNav = showBottomNav && !shouldHideNav;

  return (
    <View style={styles.container}>
      {children}
      {showNav && <BottomNavigation onMorePress={() => setDrawerVisible(true)} />}
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
