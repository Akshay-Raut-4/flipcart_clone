import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { products } from '../../constant/data'
import { makeStyles, Box, Typography } from '@material-ui/core'
import Countdown from 'react-countdown';

// import { typography } from '@material-ui/system';

const useStyle = makeStyles({
    component: {
        marginTop: 12,
        background: '#FFFFFF'
    },
    deal: {
        padding: '15px 20px',
        display:'flex'
    },
    image: {
        height: 150
    }

})
const responsive = {

    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 5
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
    }
};
const timerURL = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/timer_a73398.svg';

const Slide = () => {

    const classes = useStyle();

    return (
        <Box className={classes.component}>
            <Box className={classes.deal}>
                <Typography > Deal of the day</Typography>
                <img src={timerURL} style={{width:24}}/>
                <Countdown date={Date.now() + 5.04e+7} />,
            </Box>
            <Carousel
                infinite={true}
                draggable={false}
                // centermode={false}
                centerMode={true}
                autoPlay={true}
                autoPlaySpeed={10000}
                keyBoardControl={true}
                removeArrowOnDeviceType={["tablet", "mobile"]}
                containerClass="carousel-container"
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
                responsive={responsive}

            >
                {
                    products.map((product) => (
                        <img src={product.url} className={classes.image} />
                    ))
                }

            </Carousel>
        </Box>
    )
}

export default Slide;