
import Carousel from 'react-material-ui-carousel';
import { Box, makeStyles, Typography } from '@material-ui/core';
import {bannerData} from '../../constant/data'

const useStyle=makeStyles({
  image:{
      width:'100%',
      height:280
  },
  carousel:{
      marginTop:10
  }

})
const Banner = () => {
    const classes=useStyle()
    return (
        <Carousel
        autoPlay={true}
        animation='slide'
        indicators={false}
        navButtonsAlwaysVisible={true}
        cycleNavigation={true}
        navButtonsProps={{
             style:{
                 background:'#FFFFFF',
                 color:'#494949',
                 borderRadius:0,
                 margin:0
             }
        }}
        className={classes.carousel}
        >
            {
                bannerData.map( bannerData => (
                <img src={bannerData} className={classes.image}/>
            ))
            }
        </Carousel>
    )
}

export default Banner;