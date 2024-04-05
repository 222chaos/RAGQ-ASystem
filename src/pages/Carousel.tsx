import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './Carousel.module.css';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

function Carousel({ setClicked, setSelectedImageInfo }) {
  const sliderRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [slidesToShow, setSlidesToShow] = useState(3); // 初始 slidesToShow 数量为 3，可以根据需要进行调整
  const imageInfo = ['需求工程', '操作系统', '计算机网络'];
  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '10px',
    slidesToShow: slidesToShow,
    speed: 500,
    dots: true,
    arrows: false,
  };
  const imageUrls = [
    'https://node2d-public.hep.com.cn/37197bc254b97d32e5a1743d1428c44e.jpg-small?e=1709741130&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:-ICrqml9NpE0GNWMuQ7aAU1e6lI=',
    'https://node2d-public.hep.com.cn/bbd7693befd221e400c76cd30adb086d.jpg-small?e=1709742273&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:Zn62YEcqP-WMlsKOH3dbSqeVnvs=',
    'https://node2d-public.hep.com.cn/0747dff8c1bf2f5d32531a6e5a9ec707.jpg-small?e=1709741710&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:OFVZbtwB5rWnJgQldNA76WjcyPM=',
  ];

  useEffect(() => {
    // 监听窗口大小变化，根据屏幕宽度调整 slidesToShow 的数量
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        setSlidesToShow(1);
      } else if (screenWidth <= 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleClick = (index) => {
    if (index === selectedImageIndex) {
      setSelectedImageIndex(null);
      setSelectedImageInfo(null);
    } else {
      setSelectedImageIndex(index);
      setSelectedImageInfo(imageInfo[index]);
      sliderRef.current.slickGoTo(index - 1);
      setClicked(true);
      console.log('info===', imageInfo[index]);
    }
  };

  const handlePrev = () => {
    sliderRef.current.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current.slickNext();
  };

  return (
    <div className={styles.container}>
      <Slider ref={sliderRef} {...settings}>
        {imageUrls.map((url, index) => (
          <div key={index} className={styles['slider-item']}>
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className={`${
                selectedImageIndex === index ? styles.selected : ''
              }`}
              onClick={() => handleClick(index)}
            />
          </div>
        ))}
      </Slider>
      {slidesToShow > 1 && (
        <>
          <div className={styles.leftArrow} onClick={handlePrev}>
            <ArrowLeftOutlined style={{ fontSize: '32px' }} />
          </div>
          <div className={styles.rightArrow} onClick={handleNext}>
            <ArrowRightOutlined style={{ fontSize: '32px' }} />
          </div>
        </>
      )}
    </div>
  );
}

export default Carousel;
