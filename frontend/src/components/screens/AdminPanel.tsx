import { toast } from 'react-toastify'
import 'leaflet/dist/leaflet.css'
import '../../styles/Map.css'
import { useCookies } from 'react-cookie'
import { LoginForm } from '@/components/organisms/LoginForm'
import { login } from '@/services/admin'
import AdminMap from '@/components/organisms/AdminMap'

function AdminPanel() {
  const [cookies, setCookie] = useCookies(['admin-jwt'])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value
    try {
      const response = await login(email, password)
      if (response.token) {
        setCookie('admin-jwt', response.token)
        toast.success('Inicio de sesion correcto!', {
          closeOnClick: true,
          position: 'top-left',
        })
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.log(error)
      toast.error(
        'Hubo un error en el inicio de sesion, verifica tus credenciales',
        {
          closeOnClick: true,
          position: 'top-left',
        },
      )
    }
  }

  return cookies['admin-jwt'] ? (
    <AdminMap />
  ) : (
    <LoginForm handleSubmit={handleSubmit} />
  )
}

export default AdminPanel
