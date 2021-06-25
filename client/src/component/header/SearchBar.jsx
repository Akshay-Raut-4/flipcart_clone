import {  makeStyles,fade,InputBase } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';
// import SearchBar from './SearchBar'
const useStyle = makeStyles((theme)=>({
    search: {
        
        borderRadius: 2,
        backgroundColor: '#fff',
      
        marginLeft: 10,
        width: '38%',
        display:'flex',
        
       
      },
      searchIcon: {
        padding: 5,
        height: '100%',
        // position: 'absolute',
        // pointerEvents: 'none',
        display: 'flex',
        color:'blue'
      },
      inputRoot: {
       fontSize:'unset',
        width:'100%'
      },
      inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        marginLeft:20
      },
})
)
const SearchBar = () => {
    const classes = useStyle();
    return (
        <div className={classes.search}>
            
            <InputBase
                placeholder="Search for product brand and more"
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
            />
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
        </div>
    )
}

export default SearchBar;