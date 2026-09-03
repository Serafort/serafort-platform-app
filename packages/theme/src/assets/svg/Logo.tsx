import React from 'react'

const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <img
      src='/platform_logo.svg'
      alt='Platform Logo'
      style={{
        width: '2.5em',
        height: 'auto',
        ...props.style,
      }}
    />
  )
}

export default Logo
