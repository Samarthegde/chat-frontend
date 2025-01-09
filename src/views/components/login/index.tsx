import {useEffect, useState} from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import {nip06, getPublicKey} from 'nostr-tools';
import ImportAccount from 'views/components/dialogs/import-account';
import MetadataForm from 'views/components/metadata-form';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import useModal from 'hooks/use-modal';
import {keysAtom, profileAtom, backupWarnAtom, ravenAtom, ravenStatusAtom} from 'atoms';
import Creation from 'svg/creation';
import Import from 'svg/import';
import {storeKeys} from 'local-storage';
import {Keys} from 'types';


const Login = (props: { onDone: () => void }) => {
    const {onDone} = props;
    const {isSm} = useMediaBreakPoint();
    const [t,] = useTranslation();
    const [, showModal] = useModal();
    const [, setKeys] = useAtom(keysAtom);
    const [profile, setProfile] = useAtom(profileAtom);
    const [, setBackupWarn] = useAtom(backupWarnAtom);
    const [raven] = useAtom(ravenAtom);
    const [ravenStatus] = useAtom(ravenStatusAtom);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    
    

    useEffect(() => {
        if (step === 1 && ravenStatus.ready) setStep(2);
    }, [step, ravenStatus.ready],);

    useEffect(() => {
        if (profile) onDone();
    }, [profile]);

    const createAccount = () => {
        const priv = nip06.privateKeyFromSeedWords(nip06.generateSeedWords());
        loginPriv(priv);
        setBackupWarn(true);
    }

    const importAccount = () => {
        showModal({
            body: <ImportAccount onSuccess={(key, type) => {
                showModal(null);
                if (type === 'priv') {
                    loginPriv(key);
                } else if (type === 'pub') {
                    proceed({priv: 'none', pub: key});
                }
            }}/>
        });
    }    

    const loginPriv = (priv: string) => {
        const pub = getPublicKey(priv);
        proceed({priv, pub});
    }

    const proceed = (keys: Keys) => {
        storeKeys(keys).then(() => {
            setKeys(keys);
            setProfile(null);
            if (keys?.priv === 'none') {
                onDone();
                return;
            }
            setStep(1);
        });
    }

    return <>
        {(() => {
            if (step === 1) {
                return <Box sx={{display: 'flex', justifyContent: 'center'}}><CircularProgress/></Box>
            }

            if (step === 2) {
                return <>
                
                    <Box sx={{color: 'text.secondary', mb: '28px'}}>{t('Setup your profile')}</Box>
                    <MetadataForm
                        skipButton={<Button onClick={onDone}>{t('Skip')}</Button>}
                        submitBtnLabel={t('Finish')}
                        onSubmit={(data) => {
                            raven?.updateProfile(data).then(() => onDone());
                        }}/>
                    <h2></h2>
                </>
            }

            return <>
                <Box sx={{
                    display: 'flex',
                    flexDirection: isSm ? 'row' : 'column'
                }}>
                    <Button variant="login" size="large" disableElevation fullWidth onClick={createAccount}
                            sx={{
                                mb: '22px',
                                p: '20px 26px',
                                mr: isSm ? '22px' : null,
                            }}
                            startIcon={<Creation width={38}/>}>
                        {t('Sign Up')}
                    </Button>
                    <Button variant="login" size="large" disableElevation fullWidth onClick={importAccount}
                            sx={{mb: '22px', p: '20px 26px'}} startIcon={<Import width={38}/>}>
                        {t('Sign In')}
                    </Button>
                </Box>
            </>
        })()}
    </>
}

export default Login;
