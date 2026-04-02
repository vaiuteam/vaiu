"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type ForgotPasswordSchema, forgotPasswordSchema } from "../schemas";
import { useForgotPassword } from "../api/use-forgot-password";
import { motion } from "motion/react";

export const ForgotPasswordCard = () => {
  const { mutate, isPending } = useForgotPassword();

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordSchema) => {
    mutate({ email: values.email });
  };

  return (
    <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)] md:w-[487px]">
      <CardHeader className="flex flex-col items-center p-7 text-center">
        <Link href="/sign-in" className="items-start self-start">
          <Button variant="link" size="sm" className="px-0 text-muted-foreground">
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
              <ArrowLeft className="h-4 w-4" />
            </motion.div>
            Back to Sign In
          </Button>
        </Link>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Forgot Password
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a recovery link
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isPending}
            >
              Send Recovery Email
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card >
  );
};
