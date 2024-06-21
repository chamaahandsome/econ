// 'use client'
// import { zodResolver } from '@hookform/resolvers/zod'
// import React, { useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from '@/components/ui/card'
// import { Input } from '../ui/input'
// import { Button } from '../ui/button'
// import Loading from '../global/loading'
// import { ContactUserFormSchema } from '@/lib/types'
// import { saveActivityLogsNotification, upsertContact } from '@/lib/queries'
// import { toast } from '../ui/use-toast'
// import { useRouter } from 'next/navigation'
// import { useModal } from '@/providers/modal-provider'

// interface ContactUserFormProps {
//   vendorId: string
// }

// const ContactUserForm: React.FC<ContactUserFormProps> = ({ vendorId }) => {
//   const { setClose, data } = useModal()
//   const router = useRouter()
//   const form = useForm<z.infer<typeof ContactUserFormSchema>>({
//     mode: 'onChange',
//     resolver: zodResolver(ContactUserFormSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//     },
//   })

//   useEffect(() => {
//     if (data.contact) {
//       form.reset(data.contact)
//     }
//   }, [data, form.reset])

//   const isLoading = form.formState.isLoading

//   const handleSubmit = async (
//     values: z.infer<typeof ContactUserFormSchema>
//   ) => {
//     try {
//       const response = await upsertContact({
//         email: values.email,
//         vendorId: vendorId,
//         name: values.name,
//       })
//       await saveActivityLogsNotification({
//         marketId: undefined,
//         description: `Updated a contact | ${response?.name}`,
//         vendorId: vendorId,
//       })
//       toast({
//         title: 'Success',
//         description: 'Saved funnel details',
//       })
//       setClose()
//       router.refresh()
//     } catch (error) {
//       toast({
//         variant: 'destructive',
//         title: 'Oppse!',
//         description: 'Could not save funnel details',
//       })
//     }
//   }

//   return (
//     <Card className=" w-full">
//       <CardHeader>
//         <CardTitle>Contact Info</CardTitle>
//         <CardDescription>
//           You can assign tickets to contacts and set a value for each contact in
//           the ticket.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="flex flex-col gap-4"
//           >
//             <FormField
//               disabled={isLoading}
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Full Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Name"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               disabled={isLoading}
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="email"
//                       placeholder="Email"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <Button
//               className="mt-4"
//               disabled={isLoading}
//               type="submit"
//             >
//               {form.formState.isSubmitting ? (
//                 <Loading />
//               ) : (
//                 'Save Contact Details!'
//               )}
//             </Button>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   )
// }

// export default ContactUserForm

'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { ContactUserFormSchema } from '@/lib/types'
import { saveActivityLogsNotification, upsertContact } from '@/lib/queries'
import { toast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useModal } from '@/providers/modal-provider'

interface ContactUserFormProps {
  vendorId: string
}

const ContactUserForm: React.FC<ContactUserFormProps> = ({ vendorId }) => {
  const { setClose, data } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof ContactUserFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(ContactUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: undefined, // Adjusted to use undefined instead of an empty string
    },
  })

  useEffect(() => {
    if (data.contact) {
      form.reset({
        ...data.contact,
        phone: data.contact.phone || undefined, // Ensure phone is either string or undefined
      })
    }
  }, [data, form.reset])

  const isLoading = form.formState.isLoading

  const handleSubmit = async (values: z.infer<typeof ContactUserFormSchema>) => {
    try {
      const response = await upsertContact({
        email: values.email,
        vendorId: vendorId,
        name: values.name,
        phone: values.phone,
      })
      await saveActivityLogsNotification({
        marketId: undefined,
        description: `Updated a contact | ${response?.name}`,
        vendorId: vendorId,
      })
      toast({
        title: 'Success',
        description: 'Saved contact details',
      })
      setClose()
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Could not save contact details',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact Info</CardTitle>
        <CardDescription>
          You can assign tickets to contacts and set a value for each contact in
          the ticket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loading /> : 'Save Contact Details!'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ContactUserForm
