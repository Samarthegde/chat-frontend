import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useLocation, useNavigate } from '@reach/router';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useTranslation from 'hooks/use-translation';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import usePopover from 'hooks/use-popover';
import useModal from 'hooks/use-modal';
import PrivRequester from 'views/components/app-wrapper/priv-requester';
import { backupWarnAtom, keysAtom } from 'atoms';
import Alert from 'svg/alert';
import { nip19 } from 'nostr-tools';
import CopyToClipboard from 'components/copy-clipboard';
import IconButton from '@mui/material/IconButton';
import ContentCopy from 'svg/content-copy';


const AppWrapper = (props: { children: React.ReactNode }) => {
    const theme = useTheme();
    const { isSm } = useMediaBreakPoint();
    const [t,] = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [backupWarn, setBackupWarn] = useAtom(backupWarnAtom);
    const [, setPopover] = usePopover();
    const [, setModal] = useModal();
    const [keys] = useAtom(keysAtom);

    // Hide popover and modal on page change
    useEffect(() => {
        setPopover(null);
        setModal(null);
    }, [location.pathname]);

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    if (!keys) {
        return null;
    }
    const handleCopy = () => {
        setBackupWarn(false); // Hide the warning once copied
    };
    const warnHeight = isSm ? '36px' : '50px';
    const priv_key = nip19.nsecEncode(keys.priv);

    return <>
        {backupWarn && (
            <Box sx={{
                width: '100%',
                height: warnHeight,
                background: theme.palette.warning.main,
                color: '#000',
                fontSize: '0.9em',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={() => {
                    navigate('/settings/keys').then();
                }}>
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: '10px',
                        ml: isSm ? null : '10px'
                    }}>
                        <Alert height={18} />
                    </Box>
                    {
                        t(
                            'You wont see it again. Copy it: {{priv_key}}', { priv_key })
                    }
                    <CopyToClipboard copy={priv_key}>
                        <IconButton>
                            <ContentCopy height={22}
                            onClick={handleCopy}
                            />
                        </IconButton>
                    </CopyToClipboard>
                </Box>
            </Box>
        )}
        <Box sx={{
            flexGrow: 1,
            width: '100%',
            height: backupWarn ? `calc(100% - ${warnHeight})` : '100%',
            overflow: 'hidden',
            display: 'flex',
        }}>
            {props.children}
        </Box>
        <PrivRequester />
    </>
}

export default AppWrapper;
