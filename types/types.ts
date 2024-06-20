import { JSX } from "react";

export type FooterButton = {
  link: string;
  name: string;
  icon: JSX.Element;
};

export type Work = {
  Year: string;
  Company: string;
  Duration: string;
  Role: string;
  Skills: string;
};

export type Feed = {
  title: string;
  id: string;
  description: string;
};
