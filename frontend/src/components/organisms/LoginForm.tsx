import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type LoginFormProps = React.ComponentProps<'div'> & {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
}

export function LoginForm({
  className,
  handleSubmit,
  ...props
}: LoginFormProps) {
  return (
    <div className="flex justify-center items-center h-screen bg-primary">
      <div className={cn('flex flex-col gap-6 w-[50vw]', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Administrador</CardTitle>
            <CardDescription>
              Ingrese su dirección de correo electrónico para acceder al panel
              de administración.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
