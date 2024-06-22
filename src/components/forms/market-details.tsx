'use client'
import { Market } from '@prisma/client'
import { useForm } from 'react-hook-form'
import React, { useEffect, useState } from 'react'
import { NumberInput } from '@tremor/react'
import { v4 } from 'uuid'

import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useToast } from '../ui/use-toast'

import * as z from 'zod'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import {
  deleteMarket,
  initUser,
  saveActivityLogsNotification,
  updateMarketDetails,
  upsertMarket,
} from '@/lib/queries'
import { Button } from '../ui/button'
import Loading from '../global/loading'

type Props = {
  data?: Partial<Market>
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Market name must be atleast 2 chars.' }),
  companyEmail: z.string().min(1),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  marketLogo: z.string().min(1),
})

const MarketDetails = ({ data }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [deletingMarket, setDeletingMarket] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      marketLogo: data?.marketLogo,
    },
  })
  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data])

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData
      let custId
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        }

        const customerResponse = await fetch('/api/stripe/create-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        })
        const customerData: { customerId: string } =
          await customerResponse.json()
        custId = customerData.customerId
      }

      newUserData = await initUser({ role: 'MARKET_OWNER' })
      if (!data?.customerId && !custId) return

      const response = await upsertMarket({
        id: data?.id ? data.id : v4(),
        customerId: data?.customerId || custId || '',
        address: values.address,
        marketLogo: values.marketLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: '',
        goal: 5,
      })
      toast({
        title: 'Created Market',
      })
      if (data?.id) return router.refresh()
      if (response) {
        return router.refresh()
      }
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'could not create your market',
      })
    }
  }
  const handleDeleteMarket = async () => {
    if (!data?.id) return
    setDeletingMarket(true)
    //WIP: discontinue the subscription
    try {
      const response = await deleteMarket(data.id)
      toast({
        title: 'Deleted Market',
        description: 'Deleted your market and all vendors',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'could not delete your market ',
      })
    }
    setDeletingMarket(false)
  }

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Market Information</CardTitle>
          <CardDescription>
            Lets create an market for you business. You can edit market settings
            later from the market settings tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="marketLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="marketLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Market/Convention Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your market(convention) name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Market Email</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Market Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Whitelabel Market</FormLabel>
                        <FormDescription>
                          Turning on whilelabel mode will show your market logo
                          to all sub accounts by default. You can overwrite this
                          functionality through sub account settings.
                        </FormDescription>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )
                }}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 st..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="State"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Postal Code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Create A Goal</FormLabel>
                  <FormDescription>
                    ✨ Create a goal for your market. As your business grows
                    your goals grow too so dont forget to set the bar higher!
                  </FormDescription>
                  <NumberInput
                    defaultValue={data?.goal}
                    onValueChange={async (val) => {
                      if (!data?.id) return
                      await updateMarketDetails(data.id, { goal: val })
                      await saveActivityLogsNotification({
                        marketId: data.id,
                        description: `Updated the market goal to | ${val} Vendors`,
                        vendorId: undefined,
                      })
                      router.refresh()
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Vendors Goal"
                  />
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loading /> : 'Save Market Information'}
              </Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div>
                <div>Danger Zone</div>
              </div>
              <div className="text-muted-foreground">
                Deleting your market CANNOT BE UNDONE. This will also delete all
                vendors and all data related to your vendors. Vendorss will no longer have access to funnels, contacts etc.
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingMarket}
                className="text-red-600 p-2 text-center mt-2 rounded-md hove:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingMarket ? 'Deleting...' : 'Delete Market'}
              </AlertDialogTrigger>
            </div>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action CANNOT BE UNDONE. This will permanently delete the
                Market account and all related sub accounts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingMarket}
                className="bg-destructive hover:bg-destructive"
                onClick={handleDeleteMarket}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default MarketDetails