export type Language = 'fa' | 'en';

export const translations = {
  fa: {
    appName: 'ترلوفلو',
    appSubtitle: 'مدیریت بصری پروژه‌ها با بک‌اند FastAPI و پایتون',
    pythonBackendActive: 'بک‌اند FastAPI + پایتون متصل است',
    boards: 'تخته‌ها',
    recentBoards: 'تخته‌های اخیر',
    starredBoards: 'تخته‌های ستاره‌دار',
    createNewBoard: 'ایجاد تخته جدید',
    boardTitlePlaceholder: 'عنوان تخته...',
    selectBackground: 'انتخاب تصویر پس‌زمینه',
    create: 'ایجاد کردن',
    cancel: 'انصراف',
    save: 'ذخیره',
    edit: 'ویرایش',
    delete: 'حذف',
    close: 'بستن',
    addList: 'افزودن لیست دیگر',
    addListPlaceholder: 'عنوان لیست را وارد کنید...',
    addCard: 'افزودن کارت',
    addCardPlaceholder: 'عنوان این کارت را بنویسید...',
    inList: 'در لیست',
    description: 'توضیحات کارت',
    descriptionPlaceholder: 'توضیحات کامل‌تری برای این کارت بنویسید (پشتیبانی از متن چندخطی)...',
    checklists: 'چک‌لیست‌ها',
    addChecklist: 'افزودن چک‌لیست',
    checklistTitlePlaceholder: 'عنوان چک‌لیست...',
    addItem: 'افزودن آیتم',
    addItemPlaceholder: 'عنوان کار را وارد کنید...',
    labels: 'برچسب‌ها',
    addLabel: 'ایجاد برچسب جدید',
    labelName: 'نام برچسب',
    dueDate: 'تاریخ سررسید',
    noDueDate: 'بدون سررسید',
    completed: 'تکمیل شده',
    overdue: 'گذشته از موعد',
    dueSoon: 'موعد نزدیک',
    members: 'اعضای کارت',
    assignMember: 'اختصاص عضو',
    coverColor: 'رنگ سربرگ (Cover)',
    removeCover: 'حذف کاور',
    comments: 'نظرات و گفتگو',
    writeComment: 'نظری بنویسید...',
    postComment: 'ارسال نظر',
    activity: 'تاریخچه فعالیت‌ها',
    noActivity: 'هنوز فعالیتی ثبت نشده است',
    searchCards: 'جستجو در کارت‌ها...',
    filter: 'فیلتر کردن',
    clearFilter: 'پاک کردن فیلترها',
    filterByLabel: 'فیلتر بر اساس برچسب',
    filterByDueDate: 'فیلتر بر اساس تاریخ سررسید',
    allCards: 'همه کارت‌ها',
    exportImport: 'پشتیبان‌گیری و بازیابی',
    exportData: 'دریافت خروجی JSON',
    importData: 'ورود اطلاعات از فایل JSON',
    resetData: 'بازنشانی اطلاعات نمونه',
    resetConfirm: 'آیا از بازنشانی داده‌های دیتابیس مطمئن هستید؟ همه تغییرات با نمونه اولیه جایگزین می‌شود.',
    deleteCardConfirm: 'آیا مطمئن هستید که می‌خواهید این کارت را حذف کنید؟',
    deleteListConfirm: 'آیا از حذف این لیست و تمام کارت‌های درون آن اطمینان دارید؟',
    deleteBoardConfirm: 'آیا از حذف کامل این تخته اطمینان دارید؟',
    moveCard: 'انتقال کارت به لیست دیگر',
    targetList: 'لیست مقصد',
    emptyBoardHint: 'این تخته هنوز هیچ لیستی ندارد. اولین لیست خود را بسازید!',
    dragHint: 'کارت‌ها را می‌توانید با ماوس بکشید و در ستون‌های مختلف رها کنید.',
    themes: {
      ocean: 'اقیانوس عمیق',
      sunset: 'غروب طلایی',
      forest: 'جنگل زمردین',
      midnight: 'نیمه‌شب مدرن',
      lavender: 'یاسی و بنفش',
      amber: 'کهربایی گرم'
    }
  },
  en: {
    appName: 'TrelloFlow',
    appSubtitle: 'Visual Project Management with Python Backend',
    pythonBackendActive: 'Python 3.10 Backend Connected',
    boards: 'Boards',
    recentBoards: 'Recent Boards',
    starredBoards: 'Starred Boards',
    createNewBoard: 'Create New Board',
    boardTitlePlaceholder: 'Board title...',
    selectBackground: 'Select background theme',
    create: 'Create',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    addList: 'Add another list',
    addListPlaceholder: 'Enter list title...',
    addCard: 'Add a card',
    addCardPlaceholder: 'Enter a title for this card...',
    inList: 'in list',
    description: 'Description',
    descriptionPlaceholder: 'Add a more detailed description...',
    checklists: 'Checklists',
    addChecklist: 'Add checklist',
    checklistTitlePlaceholder: 'Checklist title...',
    addItem: 'Add an item',
    addItemPlaceholder: 'Add an item...',
    labels: 'Labels',
    addLabel: 'Create new label',
    labelName: 'Label name',
    dueDate: 'Due Date',
    noDueDate: 'No due date',
    completed: 'Completed',
    overdue: 'Overdue',
    dueSoon: 'Due soon',
    members: 'Members',
    assignMember: 'Assign member',
    coverColor: 'Cover Color',
    removeCover: 'Remove cover',
    comments: 'Comments & Discussion',
    writeComment: 'Write a comment...',
    postComment: 'Post comment',
    activity: 'Activity Log',
    noActivity: 'No activity recorded yet',
    searchCards: 'Search cards...',
    filter: 'Filter',
    clearFilter: 'Clear filters',
    filterByLabel: 'Filter by label',
    filterByDueDate: 'Filter by due date',
    allCards: 'All cards',
    exportImport: 'Backup & Restore',
    exportData: 'Export JSON',
    importData: 'Import JSON',
    resetData: 'Reset to Sample Data',
    resetConfirm: 'Are you sure you want to reset the database? All changes will be replaced with fresh sample boards.',
    deleteCardConfirm: 'Are you sure you want to delete this card?',
    deleteListConfirm: 'Are you sure you want to delete this list and all its cards?',
    deleteBoardConfirm: 'Are you sure you want to delete this board completely?',
    moveCard: 'Move card to list',
    targetList: 'Target List',
    emptyBoardHint: 'This board has no lists yet. Create your first list!',
    dragHint: 'Drag and drop cards between lists to update status in real-time.',
    themes: {
      ocean: 'Deep Ocean',
      sunset: 'Golden Sunset',
      forest: 'Emerald Forest',
      midnight: 'Modern Midnight',
      lavender: 'Purple Lavender',
      amber: 'Warm Amber'
    }
  }
};

export const THEMES = [
  {
    id: 'ocean',
    nameFa: 'اقیانوس عمیق',
    nameEn: 'Deep Ocean',
    gradientClass: 'bg-gradient-to-br from-sky-800 via-indigo-900 to-slate-900',
    solidBg: '#0b192c',
    headerClass: 'bg-sky-950/70 border-sky-800/40',
    accentColor: '#38bdf8'
  },
  {
    id: 'sunset',
    nameFa: 'غروب طلایی',
    nameEn: 'Golden Sunset',
    gradientClass: 'bg-gradient-to-br from-rose-800 via-orange-900 to-slate-900',
    solidBg: '#2a0d16',
    headerClass: 'bg-rose-950/70 border-rose-800/40',
    accentColor: '#fb923c'
  },
  {
    id: 'forest',
    nameFa: 'جنگل زمردین',
    nameEn: 'Emerald Forest',
    gradientClass: 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900',
    solidBg: '#06231c',
    headerClass: 'bg-emerald-950/70 border-emerald-800/40',
    accentColor: '#34d399'
  },
  {
    id: 'midnight',
    nameFa: 'نیمه‌شب مدرن',
    nameEn: 'Modern Midnight',
    gradientClass: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-stone-950',
    solidBg: '#0f172a',
    headerClass: 'bg-zinc-950/80 border-zinc-800/60',
    accentColor: '#a1a1aa'
  },
  {
    id: 'lavender',
    nameFa: 'یاسی و بنفش',
    nameEn: 'Purple Lavender',
    gradientClass: 'bg-gradient-to-br from-purple-900 via-violet-950 to-slate-950',
    solidBg: '#1a0b2e',
    headerClass: 'bg-purple-950/70 border-purple-800/40',
    accentColor: '#c084fc'
  },
  {
    id: 'amber',
    nameFa: 'کهربایی گرم',
    nameEn: 'Warm Amber',
    gradientClass: 'bg-gradient-to-br from-amber-900 via-orange-950 to-stone-950',
    solidBg: '#261304',
    headerClass: 'bg-amber-950/70 border-amber-800/40',
    accentColor: '#fbbf24'
  }
];

export function getTheme(id: string) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toISOString().split('T')[0];
  } catch {
    return dateString || '';
  }
}
