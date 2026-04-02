"use client";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { signUpWithGithub } from "@/lib/oauth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { type LoginSchema, loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { motion } from "motion/react";

export const SignInCard = () => {
  const { mutate, isPending } = useLogin();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (values: LoginSchema) => {
    mutate({ json: values });
  };
  return (
    <Card className="size-full border-none bg-card shadow-none backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),hsl(var(--surface-elevated))] dark:shadow-[0_22px_55px_-35px_rgba(15,23,42,0.8)] md:w-[487px]">
      <CardHeader className="items-center justify-center p-7 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome Back
        </CardTitle>
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
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <Button
                    type="button"
                    variant={"link"}
                    className="-ml-4 px-0 text-muted-foreground hover:underline"
                  >
                    <Link href="/forgot-password">
                      <span className="cursor-pointer text-sm hover:underline">
                        Forgot Password?
                      </span>
                    </Link>
                  </Button>
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isPending}
            >
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <Separator className="bg-border/55" />
      </div>
      <CardContent className="p-7 pt-6">
        <Button
          onClick={() => signUpWithGithub()}
          disabled={isPending}
          variant="secondary"
          size="lg"
          className="w-full rounded-2xl border-transparent bg-background/55"
        >
          <FaGithub className="mr-2 size-5" />
          Continue with Github
        </Button>
        <motion.p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?
          <Link href="/sign-up">
            <span className="cursor-pointer text-foreground underline-offset-4 hover:underline">
              &nbsp;Signup
            </span>
          </Link>
        </motion.p>
      </CardContent>
    </Card>
  );
}
