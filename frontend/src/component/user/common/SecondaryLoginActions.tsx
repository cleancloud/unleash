import { styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const StyledContainer = styled('div')(({ theme }) => ({
    margin: 'auto auto 0 auto',
    width: '230px',
    [theme.breakpoints.down('md')]: {
        marginTop: theme.spacing(2),
    },
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontWeight: 'bold',
    textAlign: 'center',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
}));

// const StyledRef = styled('a')(({ theme }) => ({
//     fontWeight: 'bold',
//     textAlign: 'center',
// }));

const SecondaryLoginActions = () => {
    return (
        <StyledContainer>
            <StyledLink to="/forgotten-password">
                <StyledTypography variant="body2">
                    Forgot password?
                </StyledTypography>
            </StyledLink>
        </StyledContainer>
    );
};

export default SecondaryLoginActions;
