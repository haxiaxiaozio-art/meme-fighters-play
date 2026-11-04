export const categories={experience:"玩后感",balance:"平衡建议",bug:"问题反馈",other:"其他"} as const;
export type Category=keyof typeof categories;
export type PlayerComment={id:number;nickname:string;body:string;category:Category;rating:number|null;createdAt:number;isPublic?:number};
