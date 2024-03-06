import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CenterMode() {
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    dots: true,
  };

  const imageUrls = [
    /*
    "https://blognumbers.files.wordpress.com/2010/09/1.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/2.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/3.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/4.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/5.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/6.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/7.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/9.jpg",
    */
    "https://node2d-public.hep.com.cn/37197bc254b97d32e5a1743d1428c44e.jpg-small?e=1709741130&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:-ICrqml9NpE0GNWMuQ7aAU1e6lI=",
    "https://node2d-public.hep.com.cn/bbd7693befd221e400c76cd30adb086d.jpg-small?e=1709742273&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:Zn62YEcqP-WMlsKOH3dbSqeVnvs=",
    "https://node2d-public.hep.com.cn/0747dff8c1bf2f5d32531a6e5a9ec707.jpg-small?e=1709741710&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:OFVZbtwB5rWnJgQldNA76WjcyPM=",
    "https://wqxuetang.oss-cn-beijing.aliyuncs.com/cover/3/219/3219515/3219515.jpg!wqb",
  ];
  return (
    <div
      className="slider-container"
      style={{ width: "60%", margin: "0 auto", background: "#ffffff" }}
    >
      <Slider {...settings}>
        {imageUrls.map((url, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <img
              src={url}
              alt={`Image ${index + 1}`}
              style={{
                display: "block",
                margin: "auto",
                maxWidth: "30%",
                maxHeight: "30%",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CenterMode;
