import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-300">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama Lengkap"
                                    className="dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shop_name" className="text-slate-300">Nama Toko / Bisnis</Label>
                                <Input
                                    id="shop_name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    name="shop_name"
                                    placeholder="Contoh: Toko Berkah, Cafe Kopi..."
                                    className="dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                                <InputError
                                    message={errors.shop_name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="branch_name" className="text-slate-300">Nama Cabang Utama (Opsional)</Label>
                                <Input
                                    id="branch_name"
                                    type="text"
                                    tabIndex={3}
                                    name="branch_name"
                                    placeholder="Contoh: Pusat, Cabang Jakarta (Default: Pusat)"
                                    className="dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                                <InputError
                                    message={errors.branch_name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-slate-300">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={4}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-slate-300">Kata Sandi</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                    className="dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-slate-300">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Konfirmasi password"
                                    passwordrules={passwordRules}
                                    className="dark:bg-slate-900/50 dark:border-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300"
                                tabIndex={7}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Buat Akun Baru
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-400">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={8} className="text-indigo-400 hover:text-indigo-300">
                                Masuk di sini
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Mulai Bersama Tokona',
    description: 'Lengkapi data di bawah untuk mendaftarkan bisnis Anda.',
};
