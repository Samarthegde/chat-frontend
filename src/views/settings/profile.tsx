import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { RouteComponentProps, useNavigate } from '@reach/router';
import Button from '@mui/material/Button';
import { Helmet } from 'react-helmet';
import useTranslation from 'hooks/use-translation';
import useToast from 'hooks/use-toast';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import MetadataForm from 'views/components/metadata-form';
import { keysAtom, profileAtom, ravenAtom } from 'atoms';
import { Box, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import axios from 'axios';
import CopyToClipboard from 'components/copy-clipboard';
import ContentCopy from 'svg/content-copy';

const SettingsProfilePage = (_: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [profile] = useAtom(profileAtom);
    const [raven] = useAtom(ravenAtom);
    const [, showMessage] = useToast();
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [name, setName] = useState(''); // State to hold the name value


    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    const generateRandomName = async () => {
        try {
            const response = await axios.get('https://randomuser.me/api/?gender=male');
            setName(response.data.results[0].name.first + ' ' + response.data.results[0].name.last);
        } catch (error) {
            console.error('Error generating random name:', error);
        }
    };

    return <>
        <Helmet><title>{t('BangarpetChat - Profile')}</title></Helmet>
        <AppWrapper>
            <SettingsMenu />
            <AppContent>
                <SettingsHeader section={t('Profile')} />
                <SettingsContent>
                    <MetadataForm values={{
                        name: profile?.name || '',
                        about: profile?.about || '',
                        picture: profile?.picture || ''
                    }} submitBtnLabel={t('Save')} skipButton={<Button />} onSubmit={(data) => {
                        setInProgress(true);
                        raven?.updateProfile(data).then(() => {
                            showMessage(t('Your profile updated'), 'success');
                            navigate('/settings').then();
                        }).catch(e => {
                            showMessage(e.toString(), 'error');
                        }).finally(() => setInProgress(false))
                    }} inProgress={inProgress} />

                    <Box>{t('Generate a random name and paste it into the name field')}</Box>
                    <Box sx={{ my: '4px' }}>
                        <Button color='success' variant='contained' onClick={generateRandomName}>{t('Generate Random Name')}</Button>
                    </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ mr: 1 }}>{name} {/* Display the name here */}
                            <CopyToClipboard copy={name}>
                                        <IconButton>
                                            <ContentCopy height={22} />
                                        </IconButton>
                                    </CopyToClipboard>
                                    </Box>
                        </Box>
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
}

export default SettingsProfilePage;
