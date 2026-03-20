import { forwardRef, type ComponentPropsWithoutRef } from "react";

type SectionContainerProps = ComponentPropsWithoutRef<"section">;

const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  function SectionContainer({ id, className = "", children, ...rest }, ref) {
    return (
      <section
        ref={ref}
        id={id}
        className={`px-6 py-32 sm:px-8 lg:px-10 ${className}`}
        {...rest}
      >
        <div className="mx-auto max-w-8xl">{children}</div>
      </section>
    );
  },
);

export default SectionContainer;
