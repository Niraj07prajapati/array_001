#include <stdio.h>

int main() {
   /* int arr[5];

    // Assume base address of arr is 2000 and size of integer is 32 bit

    printf("%u %u", arr + 1, & arr + 1);
     */ 
   int arr[5] = {1,2,3,4,5};

/*

    printf("%d", arr[1]);
  */
    printf("%d %d\n", & arr, & arr[3]);
   printf("%d %d\n", & arr, & arr + 1);
    printf("%d %d\n", & arr, & arr + 2);
  printf("%d %d\n", & arr, & arr + 1);
    printf("%d %d\n", arr, arr + 2);
    printf("%d %d\n", & arr[2], & arr[2] + 2);
  printf("%d %d\n", & arr, & arr + 3);
    printf("%d %d\n", arr, arr + 2);

    return 0;
}