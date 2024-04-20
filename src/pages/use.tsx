import { ConfigProvider, theme } from 'antd';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import Carousel from './Carousel';
import Login from './Login';
import Transition from './Transition';
import { ThemeContext } from './_app';

const IndexPage = (props) => {
  const { themeMode } = useContext(ThemeContext);

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Transition>
        <div style={{ left: '10px' }}>
          <Login />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            style={{
              fontFamily: 'Impact, sans-serif',
              color: 'rgb(245, 34, 45)',
              textTransform: 'uppercase',
              textAlign: 'left',
              fontSize: '2.5em',
              paddingLeft: '8vw',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Reading Helper
          </h1>
          <div className="heroBlurBall"></div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '70vh',
            }}
          >
            <Carousel />
          </div>
        </motion.div>
      </Transition>
    </ConfigProvider>
  );
};

export default IndexPage;
