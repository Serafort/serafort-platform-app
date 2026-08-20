// cspell:ignore Customizer Navbars tabler
import React from 'react';
import type { ChildrenType } from '@cap/platform-core';
import { LayoutWrapper, PublicLayout, VerticalLayout, HorizontalLayout, VerticalNavigation, HorizontalNavigation, Header, VerticalFooter, HorizontalFooter, Footer as PublicFooter } from '@cap/layout';
// 
// 
import Fab from '@mui/material/Fab';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import { VerticalNavbar as Navbar, HorizontalNavbarContent, ScrollToTop, PublicNavbar, GuestNavbar, VerticalMenu, AdminMenu, HorizontalMenu, SkipToContent } from '@cap/layout';
import { useAppStore, Locale, getMode, getSystemMode, type AppStore, useAuth } from '@cap/platform-core';
import { useTranslation } from 'react-i18next';
import { useLang, getDictionary } from './utils/getDictionary';

const NavbarWrapper = React.memo(function NavbarWrapper() {
  const isAuthenticated = useAppStore((state: AppStore) => state.isAuthenticated)
  return isAuthenticated ? <GuestNavbar /> : <PublicNavbar />
})

const Layout: React.FC<ChildrenType> = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation()
  const dictionary = useLang(i18nInstance.language as Locale) as Awaited<
    ReturnType<typeof getDictionary>
  >
  const mode = getMode()
  const systemMode = getSystemMode()

  // Reactive admin state directly from the store
  const { isAdmin } = useAuth()

  const publicLayoutElement = React.useMemo(
    () => (
      <PublicLayout header={<NavbarWrapper />} footer={<PublicFooter />}>
        {children}
      </PublicLayout>
    ),
    [children]
  )

  const verticalLayoutElement = React.useMemo(
    () => (
      <VerticalLayout
        navigation={
          <VerticalNavigation key={isAdmin ? 'admin' : 'vertical'} mode={mode} systemMode={systemMode}>
            {(scrollMenu: any) =>
              isAdmin
                ? <AdminMenu dictionary={dictionary} scrollMenu={scrollMenu} />
                : <VerticalMenu dictionary={dictionary} scrollMenu={scrollMenu} />
            }
          </VerticalNavigation>
        }
        navbar={<Navbar />}
        footer={<VerticalFooter />}
      >
        {children}
      </VerticalLayout>
    ),
    [children, isAdmin, mode, systemMode, dictionary]
  )

  const horizontalLayoutElement = React.useMemo(
    () => (
      <HorizontalLayout
        header={
          <Header
            navbarContent={<HorizontalNavbarContent />}
            navigation={
              <HorizontalNavigation menu={<HorizontalMenu dictionary={dictionary} />} />
            }
          />
        }
        footer={<HorizontalFooter />}
      >
        {children}
      </HorizontalLayout>
    ),
    [children, dictionary]
  )

  const noLayoutElement = React.useMemo(
    () => <React.Fragment>{children}</React.Fragment>,
    [children]
  )

  return (
    <React.Fragment>
      <SkipToContent />
      <LayoutWrapper
        systemMode={systemMode}
        publicLayout={publicLayoutElement}
        verticalLayout={verticalLayoutElement}
        horizontalLayout={horizontalLayoutElement}
        noLayout={noLayoutElement}
      />
      <ScrollToTop className='mui-fixed'>
        <Fab color='primary' size='small' aria-label='scroll back to top'>
          <ArrowUpward fontSize='small' />
        </Fab>
      </ScrollToTop>
      {/* <Customizer dir={direction} /> */}
    </React.Fragment>
  )
}

export default Layout
