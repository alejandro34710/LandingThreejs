import { forwardRef, type PropsWithChildren } from "react";

type SectionContainerProps = PropsWithChildren<{
  id?: string;
  className?: string;
}>;

const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  function SectionContainer({ id, className = "", children }, ref) {
    return (
      <section
        ref={ref}
        id={id}
        className={`px-6 py-32 sm:px-8 lg:px-10 ${className}`}
      >
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    );
  },
);

export default SectionContainer;
