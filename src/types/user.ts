export interface IUser {
  _id: string;
  name: string;
  surname: string;
  phoneNumber: string;
  address: string;
  passport: string;
  birthday: string;
  managerId: string;
  telegramId: string;
}

export interface IUserApproved {
  userId: string;
  isApproved: boolean;
}

export interface IUserAddCourse {
  userId: string;
  course: { courseId: string; isPaid: boolean };
}

export interface IUserAddTutorial {
  userId: string;
  tutorial: { tutorialId: string; isPaid: boolean };
}
