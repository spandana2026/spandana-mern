import { useEffect } from "react";
import { useLocation } from "wouter";

export default function GetInvolved() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/volunteer"); }, [setLocation]);
  return null;
}
